

import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiCall } from "@/lib/apiCall";
import {
  addTask,
  removeTask,
  replaceTask,
  updateTaskLocal,
  setUpdating,
  removeUpdating,
  FullTaskFields,
} from "../slices/TaskDetails";

/* ================= TYPES ================= */

interface CreateTaskInput {
  title: string;
  listId: string;
  emoji?: string | null;
  dueDate: string;
  priority: string;
  attachment?: File | null;
}

interface ApiTask {
  id: string;
  listId: string;
  title: string;
  priority: string;
  dueDate: string;
  isChecked: boolean;
  description: string | null;
  attachment: unknown;
  attagementId?: string;
  listName?: string;
}

/* ================= TEMP ID ================= */

let tempIdCounter = -1;
const getTempId = () => tempIdCounter--;

/* ================= MAP ================= */

const mapTask = (task: ApiTask): FullTaskFields => ({
  id: task.id,
  title: task.title,
  isChecked: task.isChecked,
  dueDate: task.dueDate,
  priority: task.priority.charAt(0) + task.priority.slice(1).toLowerCase(),
  listId: task.listId,
  attachment: task.attachment ?? [],
  attagementId: task.attagementId ?? "",
  desc: task.description ?? "",
  collab: [],
  listName: task.listName ?? "",
});

/* ================= DEBOUNCE STORAGE ================= */

const timers: Record<string, NodeJS.Timeout> = {};
const pending: Record<string, Partial<FullTaskFields>> = {};

/* ================= UPDATE TASK ================= */
export const updateTaskDebouncedThunk =
  (data: Partial<FullTaskFields> & { id: string }) =>
  async (dispatch: any) => {
    const { id, ...rest } = data;

    pending[id] = { ...pending[id], ...rest };

    dispatch(updateTaskLocal(data));
    dispatch(setUpdating(id));

    if (timers[id]) clearTimeout(timers[id]);

    timers[id] = setTimeout(async () => {
      try {
        const payload: any = { ...pending[id] };

        // remove empty values
        Object.keys(payload).forEach((key) => {
          if (payload[key] === undefined || payload[key] === null) {
            delete payload[key];
          }
        });

        if (!Object.keys(payload).length) {
          dispatch(removeUpdating(id));
          delete pending[id];
          delete timers[id];
          return;
        }

        /* ✅ ALWAYS use FormData (same as create) */
        const formData = new FormData();

        Object.keys(payload).forEach((key) => {
          if (key === "attachment" && payload[key] instanceof File) {
            formData.append("attachment", payload[key]);
          } else {
            formData.append(key, String(payload[key]));
          }
        });

        const res = await apiCall<{ data: ApiTask }>(
          `/api/lists/task/${id}`,
          {
            method: "PATCH",
            body: formData,
          }
        );

        dispatch(updateTaskLocal(mapTask(res.data)));

        delete pending[id];
        delete timers[id];
      } catch (err) {
        console.error("Update failed:", err);
      } finally {
        dispatch(removeUpdating(id));
      }
    }, 600);
  };

/* ================= CREATE TASK ================= */
export const createTaskThunk = createAsyncThunk(
  "tasks/create",
  async (data: CreateTaskInput, { dispatch, rejectWithValue }) => {
    const tempId = getTempId();

    const optimistic: FullTaskFields = {
      id: tempId.toString(),
      title: data.title,
      isChecked: false,
      dueDate: data.dueDate,
      priority: data.priority,
      listId: data.listId,
      attachment: null,
      desc: "",
      collab: [],
      attagementId: "",
      listName: "",
    };

    dispatch(addTask(optimistic));

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("listId", data.listId);
      formData.append("emoji", data.emoji || "");
      formData.append("dueDate", data.dueDate);
      formData.append("priority", data.priority);

      if (data.attachment) {
        formData.append("attachment", data.attachment);
      }

      const res = await apiCall<{ data: ApiTask }>("/api/lists/task", {
        method: "POST",
        body: formData,
      });

      const realTask = mapTask(res.data);

      dispatch(
        replaceTask({
          tempId: tempId.toString(),
          realTask,
        })
      );

      return realTask;
    } catch (err: any) {
      dispatch(removeTask(tempId.toString()));
      return rejectWithValue(err.message);
    }
  }
);


/* ================= GET TASKS ================= */

export const getTasksThunk = createAsyncThunk(
  "tasks/get",
  async (listId: string, { rejectWithValue }) => {
    try {
      const res = await apiCall<{ data: ApiTask[] }>(
        `/api/lists/task/${listId}`
      );

      return res.data.map(mapTask);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

/* ================= DELETE TASK ================= */

export const deleteTaskThunk = createAsyncThunk(
  "tasks/delete",
  async (
    { taskId, listId }: { taskId: string; listId: string },
    { rejectWithValue }
  ) => {
    try {
      await apiCall(`/api/lists/${listId}/task/${taskId}`, {
        method: "DELETE",
      });

      return { taskId };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);