import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiCall } from "@/lib/apiCall";
import {
  addTask,
  removeTask,
  replaceTask,
  updateTaskLocal,
} from "../slices/TaskDetails";

/* ================= TYPES ================= */

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string | null;
  createdAt: string;
  priority: "Low" | "Medium" | "High" | "None";
  isChecked: boolean;
  listId: string;
}

interface ApiTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string;
  priority: string;
  isChecked: boolean;
  listId?: string;
}

interface CreateTaskInput {
  title: string;
  listId: string;
  dueDate: string;
  priority: Task["priority"];
  emoji?: string | null; // ✅ ONLY HERE
}

/* ================= MAPPER ================= */

const mapTask = (task: ApiTask, listId?: string): Task => ({
  id: task.id,
  title: task.title,
  description: task.description ?? "",
  dueDate: task.dueDate ?? null,
  createdAt: task.createdAt,
  priority: (task.priority || "None") as Task["priority"],
  isChecked: task.isChecked ?? false,
  listId: task.listId ?? listId!,
});

/* ================= CREATE ================= */
export const createInboxTaskThunk = createAsyncThunk(
  "tasks/createInbox",
  async (data: CreateTaskInput, { dispatch, rejectWithValue }) => {
    const tempId = Date.now().toString();

    // Merge emoji into title
    const finalTitle = data.emoji ? `${data.emoji} ${data.title}` : data.title;

    const optimistic: Task = {
      id: tempId,
      title: finalTitle,
      description: "",
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
      priority: data.priority,
      isChecked: false,
    };

    // Optimistic update
    dispatch(addTask(optimistic));

    try {
      const res = await apiCall<{ data: ApiTask }>("/api/task/inbox", {
        method: "POST",
        body: JSON.stringify({
          title: finalTitle,
          dueDate: data.dueDate,
          priority: data.priority,
        }),
      });

      dispatch(
        replaceTask({
          tempId,
          realTask: mapTask(res.data),
        }),
      );

      return res.data;
    } catch (err: unknown) {
      dispatch(removeTask(tempId));

      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to create inbox task",
      );
    }
  },
);

export const createTaskThunk = createAsyncThunk(
  "tasks/create",
  async (data: CreateTaskInput, { dispatch, rejectWithValue }) => {
    const tempId = Date.now().toString();

    /* 🔥 merge emoji into title */
    const finalTitle = data.emoji ? `${data.emoji} ${data.title}` : data.title;

    const optimistic: Task = {
      id: tempId,
      title: finalTitle,
      description: "",
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
      priority: data.priority,
      isChecked: false,
      listId: data.listId,
    };

    dispatch(addTask(optimistic));

    try {
      const res = await apiCall<{ data: ApiTask }>("/api/task", {
        method: "POST",
        body: JSON.stringify({
          title: finalTitle, // ✅ already merged
          listId: data.listId,
          dueDate: data.dueDate,
          priority: data.priority,
        }),
      });

      dispatch(
        replaceTask({
          tempId,
          realTask: mapTask(res.data),
        }),
      );

      return res.data;
    } catch (err: unknown) {
      dispatch(removeTask(tempId));
      return rejectWithValue(err.message);
    }
  },
);

export const moveTaskThunk = createAsyncThunk(
  "tasks/move",
  async (
    { taskId, newListId }: { taskId: string; newListId: string },
    { dispatch, getState, rejectWithValue },
  ) => {
    const state = getState() as RootState;

    const existingTask = state.task.tasks.find((t: Task) => t.id === taskId);

    if (!existingTask) return;

    if (existingTask.listId === newListId) return;

    const oldListId = existingTask.listId;

    try {
      /* ================= OPTIMISTIC ================= */
      dispatch(
        updateTaskLocal({
          id: taskId,
          listId: newListId,
        }),
      );

      /* ================= API ================= */
      const res = await apiCall<{ data: ApiTask }>(`/api/task/${taskId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json", // 🔥 REQUIRED
        },
        body: JSON.stringify({ listId: newListId }),
      });

      /* ================= HARD SYNC ================= */
      // 🔥 IMPORTANT: always trust backend
      dispatch(
        updateTaskLocal({
          id: res.data.id,
          title: res.data.title,
          description: res.data.description ?? undefined,
          dueDate: res.data.dueDate ?? null,
          priority: res.data.priority,
          isChecked: res.data.isChecked,
          listId: res.data.listId,
        }),
      );

      return res.data;
    } catch (err: unknown) {
      /* ================= ROLLBACK ================= */
      dispatch(
        updateTaskLocal({
          id: taskId,
          listId: oldListId,
        }),
      );

      return rejectWithValue(err.message);
    }
  },
);

/* ================= DELETE ================= */

export const deleteTaskThunk = createAsyncThunk(
  "tasks/delete",
  async (
    { taskId, listId }: { taskId: string; listId: string },
    { rejectWithValue },
  ) => {
    try {
      await apiCall(`/api/task/${listId}/${taskId}`, {
        method: "DELETE",
      });

      return { taskId };
    } catch (err: unknown) {
      return rejectWithValue(err.message);
    }
  },
);

const timers: Record<string, NodeJS.Timeout> = {};
const pending: Record<string, Partial<Task>> = {};

export const updateTaskDebouncedThunk =
  (data: Partial<Task> & { id: string }) =>
  async (dispatch: unknown, getState: unknown) => {
    const { id, ...rest } = data;

    const state = getState();

    const existingTask = state.task.tasks.find((t: Task) => t.id === id);

    // fallback for search page
    const resolvedListId = existingTask?.listId || data.listId;

    if (!resolvedListId) return;

    /* ================= MERGE PENDING ================= */
    pending[id] = {
      ...pending[id],
      ...rest,
    };

    /* ================= OPTIMISTIC UPDATE ================= */
    dispatch(updateTaskLocal(data));

    if (timers[id]) clearTimeout(timers[id]);

    timers[id] = setTimeout(async () => {
      try {
        const raw = pending[id];

        if (!raw) return;

        const payload: Partial<Task> & { listId: string } = {
          listId: resolvedListId,
        };

        if (raw.title !== undefined) {
          payload.title = raw.title;
        }
        if (raw.description !== undefined) {
          payload.description = raw.description;
        }
        if (raw.dueDate !== undefined) {
          payload.dueDate = raw.dueDate;
        }

        if (raw.priority !== undefined) {
          payload.priority = raw.priority;
        }

        if (raw.isChecked !== undefined) {
          payload.isChecked = raw.isChecked;
        }

        // no actual updates
        if (Object.keys(payload).length === 1) return;

        const res = await apiCall<{ data: ApiTask }>(`/api/task/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        /* ================= HARD SYNC ================= */
        dispatch(updateTaskLocal(mapTask(res.data, resolvedListId)));

        delete pending[id];
        delete timers[id];
      } catch (err) {
        console.error("Update failed:", err);
      }
    }, 600);
  };
