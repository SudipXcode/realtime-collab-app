// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { apiCall } from "@/lib/apiCall";
// import {
//   addTask,
//   removeTask,
//   replaceTask,
//   updateTaskLocal,
//   startTaskUpdating,
//   stopTaskUpdating,
//   FullTaskFields,
// } from "../slices/TaskDetails";

// /* ================= TYPES ================= */

// interface CreateTaskInput {
//   title: string;
//   listId: string;
//   emoji?: string | null;
//   dueDate: string;
//   priority: string;
//   attachment?: File | null;
//   attagementId?: string;
// }

// interface ApiTask {
//   id: string;
//   listId: string;
//   title: string;
//   priority: string;
//   dueDate: string;
//   isChecked: boolean;
//   description: string | null;
//   attachment: unknown;
//   attagementId?: string;
//   listName?: string;
// }

// /* ================= TEMP ================= */

// let tempIdCounter = -1;
// const getTempId = () => tempIdCounter--;

// /* ================= MAP ================= */

// const mapTask = (task: ApiTask): FullTaskFields => ({
//   id: task.id,
//   title: task.title,
//   isChecked: task.isChecked,
//   dueDate: task.dueDate,
//   priority: task.priority.charAt(0) + task.priority.slice(1).toLowerCase(),
//   listId: task.listId,
//   attachment: task.attachment ?? "",
//   attagementId: task.attagementId ?? "",
//   desc: task.description ?? "",
//   collab: [],
//   listName: task.listName ?? "",
// });

// /* ================= DEBOUNCE UPDATE ================= */

// // const timers: Record<string, NodeJS.Timeout> = {};
// // const pending: Record<string, Partial<FullTaskFields>> = {};

// // export const updateTaskDebouncedThunk =
// //   (data: Partial<FullTaskFields> & { id: string }) =>
// //   async (dispatch: any) => {
// //     const { id, ...rest } = data;

// //     // ✅ merge updates per task
// //     pending[id] = { ...(pending[id] || {}), ...rest };

// //     // ✅ optimistic UI
// //     dispatch(updateTaskLocal(data));

// //     // ✅ spinner start
// //     dispatch(startTaskUpdating(id));

// //     // ✅ debounce
// //     if (timers[id]) clearTimeout(timers[id]);

// //     timers[id] = setTimeout(async () => {
// //       try {
// //         let payload: any = { ...pending[id] };

// //         /* ================= CLEAN PAYLOAD ================= */

// //         Object.keys(payload).forEach((key) => {
// //           const value = payload[key];

// //           // remove undefined
// //           if (value === undefined) delete payload[key];

// //           // prevent empty title
// //           if (key === "title" && value === "") delete payload.title;

// //           // remove null invalid
// //           if ((key === "title" || key === "dueDate") && value === null) {
// //             delete payload[key];
// //           }

// //           // ✅ remove attachment
// //           if (key === "attachment" && value === null) {
// //             payload.removeAttachment = true;
// //             delete payload.attachments;
// //           }
// //         });

// //         // ❌ nothing to send
// //         if (Object.keys(payload).length === 0) {
// //           dispatch(stopTaskUpdating(id));
// //           delete timers[id];
// //           return;
// //         }

// //         /* ================= FILE EXTRACTION ================= */

// //         let file: File | null = null;

// //         if (payload.attachments instanceof File) {
// //           file = payload.attachments;
// //         } else if (
// //           payload.attachments &&
// //           typeof payload.attachments === "object" &&
// //           payload.attachments.file instanceof File
// //         ) {
// //           // ✅ case: { file, url }
// //           file = payload.attachments.file;
// //         } else if (Array.isArray(payload.attachments)) {
// //           file = payload.attachments[0] || null;
// //         }

// //         /* ================= BUILD BODY ================= */

// //         let bodyToSend: any = payload;

// //         if (file || payload.removeAttachment) {
// //           const formData = new FormData();

// //           // ✅ append file
// //           if (file) {
// //             formData.append("attachment", file); // 🔥 MUST MATCH BACKEND
// //           }

// //           // ✅ remove attachment
// //           if (payload.removeAttachment) {
// //             formData.append("removeAttachment", "true");
// //           }

// //           // ✅ append other fields
// //           Object.keys(payload).forEach((key) => {
// //             if (key !== "attachment" && key !== "removeAttachment") {
// //               const value = payload[key];

// //               if (value !== undefined && value !== null) {
// //                 if (Array.isArray(value)) {
// //                   formData.append(key, JSON.stringify(value));
// //                 } else {
// //                   formData.append(key, String(value));
// //                 }
// //               }
// //             }
// //           });

// //           bodyToSend = formData;
// //         }

// //         /* ================= API CALL ================= */

// //         await apiCall(`/api/lists/task/${id}`, {
// //           method: "PATCH",
// //           body: bodyToSend,
// //         });

// //         // ✅ cleanup
// //         delete pending[id];
// //         delete timers[id];
// //       } catch (err) {
// //         console.error("Debounced update failed", err);
// //       } finally {
// //         dispatch(stopTaskUpdating(id));
// //       }
// //     }, 600);
// //   };
// const timers: Record<string, NodeJS.Timeout> = {};
// const pending: Record<string, Partial<FullTaskFields>> = {};

// export const updateTaskDebouncedThunk =
//   (data: Partial<FullTaskFields> & { id: string }) => async (dispatch: any) => {
//     const { id, ...rest } = data;

//     /* ================= SAFE MERGE ================= */

//     if (!pending[id]) pending[id] = {};

//     // ✅ reset pending each time (CRITICAL FIX)
//     pending[id] = {};

//     // ✅ only keep current update
//     Object.keys(rest).forEach((key) => {
//       const value = rest[key as keyof typeof rest];

//       if (value !== undefined) {
//         pending[id][key] = value;
//       }
//     });

//     /* ================= OPTIMISTIC UI ================= */

//     dispatch(updateTaskLocal(data));
//     dispatch(startTaskUpdating(id));

//     /* ================= DEBOUNCE ================= */

//     if (timers[id]) clearTimeout(timers[id]);

//     timers[id] = setTimeout(async () => {
//       try {
//         const payload: any = { ...pending[id] };
//         // ✅ FINAL SAFETY → don't send checkbox unless explicitly updated
//         if (!("isChecked" in data)) {
//           delete payload.isChecked;
//         }

//         /* ================= CLEAN PAYLOAD ================= */

//         Object.keys(payload).forEach((key) => {
//           const value = payload[key];

//           // ❌ remove undefined
//           if (value === undefined) delete payload[key];

//           // ❌ prevent empty title
//           if (key === "title" && value === "") delete payload.title;

//           // ❌ prevent invalid nulls
//           if ((key === "title" || key === "dueDate") && value === null) {
//             delete payload[key];
//           }

//           // ✅ remove attachment flag
//           if (key === "attachment" && value === null) {
//             payload.removeAttachment = true;
//             delete payload.attachment;
//           }
//         });

//         // 🔥 CRITICAL FIX → prevent checkbox reset bug
//         if (payload.isChecked === undefined) {
//           delete payload.isChecked;
//         }

//         // ❌ nothing to send
//         if (Object.keys(payload).length === 0) {
//           dispatch(stopTaskUpdating(id));
//           delete timers[id];
//           return;
//         }

//         /* ================= FILE EXTRACTION ================= */

//         let file: File | null = null;

//         if (payload.attachments instanceof File) {
//           file = payload.attachments;
//         } else if (
//           payload.attachments &&
//           typeof payload.attachments === "object" &&
//           payload.attachments.file instanceof File
//         ) {
//           file = payload.attachments.file;
//         } else if (Array.isArray(payload.attachments)) {
//           file = payload.attachments[0] || null;
//         }

//         /* ================= BUILD BODY ================= */

//         let bodyToSend: any = payload;

//         if (file || payload.removeAttachment) {
//           const formData = new FormData();

//           // ✅ file
//           if (file) {
//             formData.append("attachment", file);
//           }

//           // ✅ remove flag
//           if (payload.removeAttachment) {
//             formData.append("removeAttachment", "true");
//           }

//           // ✅ other fields
//           Object.keys(payload).forEach((key) => {
//             if (
//               key !== "attachment" &&
//               key !== "attachments" &&
//               key !== "removeAttachment"
//             ) {
//               const value = payload[key];

//               if (value !== undefined && value !== null) {
//                 if (Array.isArray(value)) {
//                   formData.append(key, JSON.stringify(value));
//                 } else {
//                   formData.append(key, String(value));
//                 }
//               }
//             }
//           });

//           bodyToSend = formData;
//         }

//         /* ================= API CALL ================= */

//         const res = await apiCall(`/api/lists/task/${id}`, {
//           method: "PATCH",
//           body: bodyToSend,
//         });

//         /* ================= CLEANUP ================= */

//         delete pending[id];
//         delete timers[id];
//         const updatedTask = mapTask(res.data);

//         dispatch(updateTaskLocal(updatedTask));
//       } catch (err) {
//         console.error("Debounced update failed", err);
//       } finally {
//         dispatch(stopTaskUpdating(id));
//       }
//     }, 600);
//   };
// /* ================= CREATE ================= */

// export const createTaskThunk = createAsyncThunk(
//   "tasks/create",
//   async (data: CreateTaskInput, { dispatch, rejectWithValue }) => {
//     const tempId = getTempId();

//     const optimisticTask: FullTaskFields = {
//       id: tempId.toString(),
//       title: data.title,
//       isChecked: false,
//       dueDate: data.dueDate,
//       priority: data.priority,
//       attachments: [],
//       desc: "",
//       collab: [],
//       listId: data.listId,
//     };

//     dispatch(addTask(optimisticTask));

//     try {
//       const formData = new FormData();

//       formData.append("title", data.title);
//       formData.append("listId", data.listId);
//       formData.append("emoji", data.emoji || "");
//       formData.append("dueDate", data.dueDate);
//       formData.append("priority", data.priority);

//       if (data.attachment) {
//         formData.append("attachment", data.attachment);
//       }

//       const res = await apiCall<{ data: ApiTask }>("/api/lists/task", {
//         method: "POST",
//         body: formData,
//       });

//       const realTask = mapTask(res.data);

//       dispatch(
//         replaceTask({
//           tempId: tempId.toString(),
//           realTask,
//         }),
//       );

//       return realTask;
//     } catch (err: any) {
//       dispatch(removeTask(tempId.toString()));
//       return rejectWithValue(err.message);
//     }
//   },
// );

// /* ================= GET ================= */

// export const getTasksThunk = createAsyncThunk(
//   "tasks/get",
//   async (listId: string, { rejectWithValue }) => {
//     try {
//       const res = await apiCall<{ data: ApiTask[] }>(
//         `/api/lists/task/${listId}`,
//       );
//       return res.data.map(mapTask);
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   },
// );

// /* ================= DELETE TASK ================= */

// export const deleteTaskThunk = createAsyncThunk(
//   "tasks/delete",
//   async (
//     { taskId, listId }: { taskId: string; listId: string },
//     { rejectWithValue },
//   ) => {
//     try {
//       const res = await apiCall(`/api/lists/${listId}/task/${taskId}`, {
//         method: "DELETE",
//       });

//       return { taskId, ...res }; // include response if needed
//     } catch (err: any) {
//       return rejectWithValue(err?.response?.data || { message: err.message });
//     }
//   },
// );

/* ================= DELETE POINT ================= */

// export const deletePointThunk = createAsyncThunk(
//   "tasks/deletePoint",
//   async (
//     { taskId, pointId }: { taskId: string; pointId: number },
//     { rejectWithValue },
//   ) => {
//     try {
//       await apiCall(`/api/lists/task/${taskId}/point/${pointId}`, {
//         method: "DELETE",
//       });

//       return { taskId, pointId };
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   },
// );
// import { createAsyncThunk } from "@reduxjs/toolkit";
// import { apiCall } from "@/lib/apiCall";
// import {
//   addTask,
//   removeTask,
//   replaceTask,
//   updateTaskLocal,
//   // startTaskUpdating,
//   // stopTaskUpdating,
//   FullTaskFields,
//   setUpdating,
//   removeUpdating,
// } from "../slices/TaskDetails";
// import { getSocket } from "@/lib/socket";
// /* ================= TYPES ================= */
// const socket = getSocket();
// interface CreateTaskInput {
//   title: string;
//   listId: string;
//   emoji?: string | null;
//   dueDate: string;
//   priority: string;
//   attachment?: File | null;
// }

// interface ApiTask {
//   id: string;
//   listId: string;
//   title: string;
//   priority: string;
//   dueDate: string;
//   isChecked: boolean;
//   description: string | null;
//   attachment: unknown;
//   attagementId?: string;
//   listName?: string;
// }

// /* ================= TEMP ID ================= */

// let tempIdCounter = -1;
// const getTempId = () => tempIdCounter--;

// /* ================= MAP ================= */

// const mapTask = (task: ApiTask): FullTaskFields => ({
//   id: task.id,
//   title: task.title,
//   isChecked: task.isChecked,
//   dueDate: task.dueDate,
//   priority: task.priority.charAt(0) + task.priority.slice(1).toLowerCase(),
//   listId: task.listId,
//   attachment: task.attachment ?? "",
//   attagementId: task.attagementId ?? "",
//   desc: task.description ?? "",
//   collab: [],
//   listName: task.listName ?? "",
// });

// /* ================= DEBOUNCE STORAGE ================= */

// const timers: Record<string, NodeJS.Timeout> = {};
// const pending: Record<string, Partial<FullTaskFields>> = {};

// /* ================= DEBOUNCED UPDATE ================= */

// export const updateTaskDebouncedThunk =
//   (data: Partial<FullTaskFields> & { id: string }) =>
//   async (dispatch: unknown) => {
//     const { id, ...rest } = data;

//     /* ================= RESET PENDING ================= */

//     pending[id] = { ...rest };

//     /* ================= OPTIMISTIC UPDATE ================= */

//     dispatch(updateTaskLocal(data));
//     // dispatch(startTaskUpdating(id));
//     dispatch(setUpdating(id));

//     /* ================= CLEAR OLD TIMER ================= */

//     if (timers[id]) clearTimeout(timers[id]);

//     timers[id] = setTimeout(async () => {
//       try {
//         const payload: unknown = { ...pending[id] };

//         // ❌ remove undefined/null
//         Object.keys(payload).forEach((key) => {
//           const value = payload[key];

//           if (value === undefined || value === null) {
//             delete payload[key];
//           }
//         });

//         // ❌ nothing to send
//         if (Object.keys(payload).length === 0) {
//           // dispatch(stopTaskUpdating(id));
//           dispatch(removeUpdating(id));

//           delete pending[id];
//           delete timers[id];
//           return;
//         }

//         /* ================= FILE HANDLING ================= */

//         let file: File | null = null;

//         if (payload.attachment instanceof File) {
//           file = payload.attachment;
//         }

//         /* ================= BUILD REQUEST ================= */

//         let body: unknown = payload;

//         if (file) {
//           const formData = new FormData();

//           formData.append("attachment", file);

//           Object.keys(payload).forEach((key) => {
//             if (key !== "attachment") {
//               formData.append(key, String(payload[key]));
//             }
//           });

//           body = formData;
//         }

//         /* ================= API CALL ================= */

//         const res = await apiCall<{ data: ApiTask }>(`/api/lists/task/${id}`, {
//           method: "PATCH",
//           body,
//         });

//         const updatedTask = mapTask(res.data);

//         dispatch(updateTaskLocal(updatedTask));

//         socket.emit("task-update", {
//           listId: updatedTask.listId,
//           task: updatedTask,
//         });

//         /* ================= CLEANUP ================= */

//         delete pending[id];
//         delete timers[id];
//       } catch (err) {
//         console.error("Debounced update failed:", err);
//       } finally {
//         dispatch(removeUpdating(id));
//       }
//     }, 600);
//   };

// /* ================= CREATE TASK ================= */

// export const createTaskThunk = createAsyncThunk(
//   "tasks/create",
//   async (data: CreateTaskInput, { dispatch, rejectWithValue }) => {
//     const tempId = getTempId();

//     const optimistic: FullTaskFields = {
//       id: tempId.toString(),
//       title: data.title,
//       isChecked: false,
//       dueDate: data.dueDate,
//       priority: data.priority,
//       listId: data.listId,
//       attachment: [],
//       desc: "",
//       collab: [],
//       attagementId: "",
//       listName: "",
//     };

//     dispatch(addTask(optimistic));

//     try {
//       const formData = new FormData();

//       formData.append("title", data.title);
//       formData.append("listId", data.listId);
//       formData.append("emoji", data.emoji || "");
//       formData.append("dueDate", data.dueDate);
//       formData.append("priority", data.priority);

//       if (data.attachment) {
//         formData.append("attachment", data.attachment);
//       }

//       const res = await apiCall<{ data: ApiTask }>("/api/lists/task", {
//         method: "POST",
//         body: formData,
//       });

//       const realTask = mapTask(res.data);

//       dispatch(
//         replaceTask({
//           tempId: tempId.toString(),
//           realTask,
//         }),
//       );
//       socket.emit("task-create", realTask);
//       return realTask;
//     } catch (err: unknown) {
//       dispatch(removeTask(tempId.toString()));
//       return rejectWithValue(err.message);
//     }
//   },
// );

// /* ================= GET TASKS ================= */

// export const getTasksThunk = createAsyncThunk(
//   "tasks/get",
//   async (listId: string, { rejectWithValue }) => {
//     try {
//       const res = await apiCall<{ data: ApiTask[] }>(
//         `/api/lists/task/${listId}`,
//       );

//       return res.data.map(mapTask);
//     } catch (err: unknown) {
//       return rejectWithValue(err.message);
//     }
//   },
// );

// /* ================= DELETE TASK ================= */

// export const deleteTaskThunk = createAsyncThunk(
//   "tasks/delete",
//   async (
//     { taskId, listId }: { taskId: string; listId: string },
//     { rejectWithValue },
//   ) => {
//     try {
//       await apiCall(`/api/lists/${listId}/task/${taskId}`, {
//         method: "DELETE",
//       });
//       socket.emit("task-delete", { taskId, listId });
//       return { taskId };
//     } catch (err: unknown) {
//       return rejectWithValue(err.message);
//     }
//   },
// );

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
// export const updateTaskDebouncedThunk =
//   (data: Partial<FullTaskFields> & { id: string }) =>
//   async (dispatch: any) => {
//     const { id, ...rest } = data;

//     pending[id] = { ...pending[id], ...rest };

//     dispatch(updateTaskLocal(data));
//     dispatch(setUpdating(id));

//     if (timers[id]) clearTimeout(timers[id]);

//     timers[id] = setTimeout(async () => {
//       try {
//         const payload: any = { ...pending[id] };

//         // remove empty values
//         Object.keys(payload).forEach((key) => {
//           if (payload[key] === undefined || payload[key] === null) {
//             delete payload[key];
//           }
//         });

//         if (!Object.keys(payload).length) {
//           dispatch(removeUpdating(id));
//           delete pending[id];
//           delete timers[id];
//           return;
//         }

//         /* ================= ALWAYS USE FORMDATA ================= */

//         const formData = new FormData();

//         Object.keys(payload).forEach((key) => {
//           const value = payload[key];

//           if (value === undefined || value === null) return;

//           if (key === "attachment" && value instanceof File) {
//             formData.append("attachment", value);
//           } else {
//             formData.append(key, String(value));
//           }
//         });

//         const res = await apiCall<{ data: ApiTask }>(
//           `/api/lists/task/${id}`,
//           {
//             method: "PATCH",
//             body: formData,
//           }
//         );

//         dispatch(updateTaskLocal(mapTask(res.data)));

//         delete pending[id];
//         delete timers[id];
//       } catch (err) {
//         console.error("Update failed:", err);
//       } finally {
//         dispatch(removeUpdating(id));
//       }
//     }, 600);
//   };
// export const updateTaskDebouncedThunk =
//   (data: Partial<FullTaskFields> & { id: string }) =>
//   async (dispatch: any) => {
//     const { id, ...rest } = data;

//     pending[id] = { ...pending[id], ...rest };

//     dispatch(updateTaskLocal(data));
//     dispatch(setUpdating(id));

//     if (timers[id]) clearTimeout(timers[id]);

//     timers[id] = setTimeout(async () => {
//       try {
//         const payload: any = { ...pending[id] };

//         Object.keys(payload).forEach((key) => {
//           if (payload[key] === undefined || payload[key] === null) {
//             delete payload[key];
//           }
//         });

//         if (!Object.keys(payload).length) {
//           dispatch(removeUpdating(id));
//           delete pending[id];
//           delete timers[id];
//           return;
//         }

//         let body: any = payload;

//         if (payload.attachment instanceof File) {
//           const formData = new FormData();
//           formData.append("attachment", payload.attachment);

//           Object.keys(payload).forEach((key) => {
//             if (key !== "attachment") {
//               formData.append(key, String(payload[key]));
//             }
//           });

//           body = formData;
//         }

//         const res = await apiCall<{ data: ApiTask }>(
//           `/api/lists/task/${id}`,
//           {
//             method: "PATCH",
//             body,
//           }
//         );

//         dispatch(updateTaskLocal(mapTask(res.data)));

//         delete pending[id];
//         delete timers[id];
//       } catch (err) {
//         console.error("Update failed:", err);
//       } finally {
//         dispatch(removeUpdating(id));
//       }
//     }, 600);
//   };

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
// export const createTaskThunk = createAsyncThunk(
//   "tasks/create",
//   async (data: CreateTaskInput, { dispatch, rejectWithValue }) => {
//     const tempId = getTempId();

//     const optimistic: FullTaskFields = {
//       id: tempId.toString(),
//       title: data.title,
//       isChecked: false,
//       dueDate: data.dueDate,
//       priority: data.priority,
//       listId: data.listId,
//       attachment: [],
//       desc: "",
//       collab: [],
//       attagementId: "",
//       listName: "",
//     };

//     dispatch(addTask(optimistic));

//     try {
//       const formData = new FormData();
//       formData.append("title", data.title);
//       formData.append("listId", data.listId);
//       formData.append("emoji", data.emoji || "");
//       formData.append("dueDate", data.dueDate);
//       formData.append("priority", data.priority);

//       if (data.attachment) {
//         formData.append("attachment", data.attachment);
//       }

//       const res = await apiCall<{ data: ApiTask }>("/api/lists/task", {
//         method: "POST",
//         body: formData,
//       });

//       const realTask = mapTask(res.data);

//       dispatch(
//         replaceTask({
//           tempId: tempId.toString(),
//           realTask,
//         })
//       );

//       return realTask;
//     } catch (err: any) {
//       dispatch(removeTask(tempId.toString()));
//       return rejectWithValue(err.message);
//     }
//   }
// );

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