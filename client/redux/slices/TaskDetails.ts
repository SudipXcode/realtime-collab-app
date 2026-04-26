// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import {
//   createTaskThunk,
//   getTasksThunk,
//   deleteTaskThunk,
// } from "../thunk/taskThunk";

// /* ================= TYPES ================= */

// export interface FullTaskFields {
//   id: string;
//   title: string;
//   listId: string;
//   isChecked: boolean;
//   dueDate: string | null;
//   priority: string;
//   attachment: any[];
//   desc: string;
//   collab: any[];
// }

// interface TasksState {
//   tasks: FullTaskFields[];
//   selectedTask: FullTaskFields | null;
//   creating: boolean;
//   loading: boolean;
//   error: string | null;
//   updatingTaskIds: string[]; // ✅ spinner control
// }

// /* ================= INITIAL ================= */

// const initialState: TasksState = {
//   tasks: [],
//   selectedTask: null,
//   loading: false,
//   error: null,
//   creating: false,
//   updatingTaskIds: [],
// };

// /* ================= SLICE ================= */

// const taskSlice = createSlice({
//   name: "tasks",
//   initialState,
//   reducers: {
//     /* ---------- BASIC ---------- */

//     setSelectedTask(state, action: PayloadAction<FullTaskFields>) {
//       state.selectedTask = action.payload;
//     },

//     setTasks(state, action: PayloadAction<FullTaskFields[]>) {
//       state.tasks = action.payload;
//     },

//     addTask(state, action: PayloadAction<FullTaskFields>) {
//       state.tasks.unshift(action.payload);
//     },

//     removeTask(state, action: PayloadAction<string>) {
//       state.tasks = state.tasks.filter((t) => t.id !== action.payload);
//     },

// mergeTasks(state, action: PayloadAction<FullTaskFields[]>) {
//   action.payload.forEach((incoming) => {
//     const index = state.tasks.findIndex(t => t.id === incoming.id)

//     if (index !== -1) {
//       state.tasks[index] = {
//         ...state.tasks[index],
//         ...incoming
//       }
//     } else {
//       state.tasks.unshift(incoming)
//     }
//   })
// },
//     replaceTask(
//       state,
//       action: PayloadAction<{ tempId: string; realTask: FullTaskFields }>,
//     ) {
//       const index = state.tasks.findIndex(
//         (t) => t.id === action.payload.tempId,
//       );

//       if (index !== -1) {
//         state.tasks[index] = action.payload.realTask;
//       }
//     },

//     /* ---------- UPDATE (IMPORTANT FIX) ---------- */

//     updateTaskLocal(
//       state,
//       action: PayloadAction<Partial<FullTaskFields> & { id: string }>,
//     ) {
//       const index = state.tasks.findIndex((t) => t.id === action.payload.id);

//       if (index !== -1) {
//         state.tasks[index] = {
//           ...state.tasks[index],
//           ...action.payload,
//         };
//       }

//       // ✅ CRITICAL FIX: keep selectedTask in sync
//       if (state.selectedTask?.id === action.payload.id) {
//         state.selectedTask = {
//           ...state.selectedTask,
//           ...action.payload,
//         };
//       }
//     },

//     /* ---------- LOADING CONTROL (MERGED) ---------- */

//     // ✅ NEW (your current usage)
//     setUpdating(state, action: PayloadAction<string>) {
//       if (!state.updatingTaskIds.includes(action.payload)) {
//         state.updatingTaskIds.push(action.payload);
//       }
//     },

//     removeUpdating(state, action: PayloadAction<string>) {
//       state.updatingTaskIds = state.updatingTaskIds.filter(
//         (id) => id !== action.payload,
//       );
//     },

//     // ✅ OLD (kept for compatibility)
//     startTaskUpdating(state, action: PayloadAction<string>) {
//       if (!state.updatingTaskIds.includes(action.payload)) {
//         state.updatingTaskIds.push(action.payload);
//       }
//     },

//     stopTaskUpdating(state, action: PayloadAction<string>) {
//       state.updatingTaskIds = state.updatingTaskIds.filter(
//         (id) => id !== action.payload,
//       );
//     },
//   },

//   /* ================= EXTRA ================= */

//   extraReducers: (builder) => {
//     builder
//       /* ---------- GET ---------- */
//       .addCase(getTasksThunk.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getTasksThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         state.tasks = action.payload;
//       })
//       .addCase(getTasksThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })

//       /* ---------- CREATE ---------- */
//       .addCase(createTaskThunk.pending, (state) => {
//         state.creating = true;
//       })
//       .addCase(createTaskThunk.fulfilled, (state) => {
//         state.creating = false;
//       })
//       .addCase(createTaskThunk.rejected, (state) => {
//         state.creating = false;
//       })

//       /* ---------- DELETE ---------- */
//       .addCase(deleteTaskThunk.fulfilled, (state, action) => {
//         const { taskId } = action.payload;

//         // remove from list
//         state.tasks = state.tasks.filter((t) => t.id !== taskId);

//         // 🔥 IMPORTANT: clear selectedTask if deleted
//         if (state.selectedTask?.id === taskId) {
//           state.selectedTask = null;
//         }
//       });
//   },
// });

// /* ================= EXPORTS ================= */

// export const {
//   setTasks,
//   addTask,
//   removeTask,
//   replaceTask,
//   updateTaskLocal,
//   setSelectedTask,

//   // ✅ new
//   setUpdating,
//   removeUpdating,

//   // ✅ old (still usable)
//   startTaskUpdating,
//   stopTaskUpdating,
//   mergeTasks
// } = taskSlice.actions;

// export default taskSlice.reducer;
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createTaskThunk,
  getTasksThunk,
  deleteTaskThunk,
} from "../thunk/taskThunk";

/* ================= TYPES ================= */

export interface FullTaskFields {
  id: string;
  title: string;
  listId: string;
  isChecked: boolean;
  dueDate: string | null;
  priority: string;
  attachment: unknown[];
  desc: string;
  collab: unknown[];
  listName?: string;
}

interface TasksState {
  tasks: FullTaskFields[];
  selectedTask: FullTaskFields | null;
  creating: boolean;
  loading: boolean;
  error: string | null;
  updatingTaskIds: string[];
}

/* ================= INITIAL ================= */

const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  creating: false,
  updatingTaskIds: [],
};

/* ================= SLICE ================= */

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    /* ================= BASIC ================= */

    setSelectedTask(state, action: PayloadAction<FullTaskFields | null>) {
      state.selectedTask = action.payload;
    },

    setTasks(state, action: PayloadAction<FullTaskFields[]>) {
      state.tasks = action.payload;
    },

    addTask(state, action: PayloadAction<FullTaskFields>) {
      state.tasks.unshift(action.payload);
    },

    removeTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);

      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    },
    replaceTask(
      state,
      action: PayloadAction<{ tempId: string; realTask: FullTaskFields }>,
    ) {
      const index = state.tasks.findIndex(
        (t) => t.id === action.payload.tempId,
      );

      if (index !== -1) {
        state.tasks[index] = action.payload.realTask;
      }
    },

    /* ================= MERGE ================= */

    mergeTasks(state, action: PayloadAction<FullTaskFields[]>) {
      action.payload.forEach((incoming) => {
        if (!incoming?.id) return;

        const index = state.tasks.findIndex((t) => t.id === incoming.id);

        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            ...incoming,
          };
        } else {
          state.tasks.unshift(incoming);
        }
      });
    },

    /* ================= UPDATE ================= */

    updateTaskLocal(
      state,
      action: PayloadAction<Partial<FullTaskFields> & { id: string }>,
    ) {
      const { id, ...changes } = action.payload;

      const index = state.tasks.findIndex((t) => t.id === id);

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          ...changes,
        };
      }

      if (state.selectedTask?.id === id) {
        state.selectedTask = {
          ...state.selectedTask,
          ...changes,
        };
      }
    },
    addTaskRealtime: (state, action) => {
      state.tasks.push(action.payload);
    },

    updateTaskRealtime: (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },

    deleteTaskRealtime: (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    /* ================= LOADING (CLEANED - SINGLE SOURCE) ================= */

    setUpdating(state, action: PayloadAction<string>) {
      if (!state.updatingTaskIds.includes(action.payload)) {
        state.updatingTaskIds.push(action.payload);
      }
    },

    removeUpdating(state, action: PayloadAction<string>) {
      state.updatingTaskIds = state.updatingTaskIds.filter(
        (id) => id !== action.payload,
      );
    },

    /* ================= ERROR CONTROL ================= */

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    clearError(state) {
      state.error = null;
    },
  },

  /* ================= THUNKS ================= */

  extraReducers: (builder) => {
    builder
      /* ---------- GET ---------- */
      .addCase(getTasksThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasksThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(getTasksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load tasks";
      })

      /* ---------- CREATE ---------- */
      .addCase(createTaskThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTaskThunk.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = (action.payload as string) || "Create failed";
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        const { taskId } = action.payload;

        state.tasks = state.tasks.filter((t) => t.id !== taskId);

        if (state.selectedTask?.id === taskId) {
          state.selectedTask = null;
        }
      });
  },
});

/* ================= EXPORTS ================= */

export const {
  setTasks,
  addTask,
  removeTask,
  mergeTasks,
  updateTaskLocal,
  setSelectedTask,
  setUpdating,
  removeUpdating,
  setError,
  clearError,
  replaceTask,
} = taskSlice.actions;

export default taskSlice.reducer;
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import {
//   createTaskThunk,
//   getTasksThunk,
//   deleteTaskThunk,
// } from "../thunk/taskThunk";

// /* ================= TYPES ================= */

// export interface FullTaskFields {
//   id: string;
//   title: string;
//   listId: string;
//   isChecked: boolean;
//   dueDate: string | null;
//   priority: string;
//   attachment: unknown[];
//   desc: string;
//   collab: unknown[];
//   attagementId?: string;
//   listName?: string;
// }

// interface TasksState {
//   tasks: FullTaskFields[];
//   selectedTask: FullTaskFields | null;
//   creating: boolean;
//   loading: boolean;
//   error: string | null;
//   updatingTaskIds: string[];
// }

// /* ================= INITIAL ================= */

// const initialState: TasksState = {
//   tasks: [],
//   selectedTask: null,
//   loading: false,
//   creating: false,
//   error: null,
//   updatingTaskIds: [],
// };

// /* ================= SLICE ================= */

// const taskSlice = createSlice({
//   name: "tasks",
//   initialState,
//   reducers: {
//     setTasks(state, action: PayloadAction<FullTaskFields[]>) {
//       state.tasks = action.payload;
//     },
//     setSelectedTask(state, action: PayloadAction<FullTaskFields | null>) {
//       state.selectedTask = action.payload;
//     },
//     addTask(state, action: PayloadAction<FullTaskFields>) {
//       state.tasks.unshift(action.payload);
//     },

//     removeTask(state, action: PayloadAction<string>) {
//       state.tasks = state.tasks.filter((t) => t.id !== action.payload);
//     },

//     replaceTask(
//       state,
//       action: PayloadAction<{ tempId: string; realTask: FullTaskFields }>,
//     ) {
//       const index = state.tasks.findIndex(
//         (t) => t.id === action.payload.tempId,
//       );
//       if (index !== -1) {
//         state.tasks[index] = action.payload.realTask;
//       }
//     },

//     updateTaskLocal(
//       state,
//       action: PayloadAction<Partial<FullTaskFields> & { id: string }>,
//     ) {
//       const index = state.tasks.findIndex((t) => t.id === action.payload.id);
//       if (index !== -1) {
//         state.tasks[index] = {
//           ...state.tasks[index],
//           ...action.payload,
//         };
//       }
//     },
//     mergeTasks(state, action: PayloadAction<FullTaskFields[]>) {
//       action.payload.forEach((incoming) => {
//         const index = state.tasks.findIndex((t) => t.id === incoming.id);

//         if (index !== -1) {
//           state.tasks[index] = {
//             ...state.tasks[index],
//             ...incoming,
//           };
//         } else {
//           state.tasks.unshift(incoming);
//         }
//       });
//     },
//     /* ✅ REALTIME SAFE */

//     addTaskRealtime(state, action: PayloadAction<FullTaskFields>) {
//       const exists = state.tasks.some((t) => t.id === action.payload.id);
//       if (!exists) {
//         state.tasks.unshift(action.payload);
//       }
//     },

//     updateTaskRealtime(state, action: PayloadAction<FullTaskFields>) {
//       const index = state.tasks.findIndex((t) => t.id === action.payload.id);
//       if (index !== -1) {
//         state.tasks[index] = action.payload;
//       }
//     },

//     deleteTaskRealtime(state, action: PayloadAction<string>) {
//       state.tasks = state.tasks.filter((t) => t.id !== action.payload);
//     },

//     setUpdating(state, action: PayloadAction<string>) {
//       if (!state.updatingTaskIds.includes(action.payload)) {
//         state.updatingTaskIds.push(action.payload);
//       }
//     },

//     removeUpdating(state, action: PayloadAction<string>) {
//       state.updatingTaskIds = state.updatingTaskIds.filter(
//         (id) => id !== action.payload,
//       );
//     },
//   },

//   extraReducers: (builder) => {
//     builder
//       .addCase(getTasksThunk.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(getTasksThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         state.tasks = action.payload;
//       })
//       .addCase(getTasksThunk.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })

//       .addCase(createTaskThunk.pending, (state) => {
//         state.creating = true;
//       })
//       .addCase(createTaskThunk.fulfilled, (state) => {
//         state.creating = false;
//       })
//       .addCase(createTaskThunk.rejected, (state) => {
//         state.creating = false;
//       })

//       .addCase(deleteTaskThunk.fulfilled, (state, action) => {
//         state.tasks = state.tasks.filter((t) => t.id !== action.payload.taskId);
//       });
//   },
// });

// export const {
//   setTasks,
//   addTask,
//   removeTask,
//   replaceTask,
//   updateTaskLocal,
//   addTaskRealtime,
//   updateTaskRealtime,
//   deleteTaskRealtime,
//   setUpdating,
//   removeUpdating,
//   setSelectedTask,
//   mergeTasks,
// } = taskSlice.actions;

// export default taskSlice.reducer;
