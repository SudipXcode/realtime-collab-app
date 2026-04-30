import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createInboxTaskThunk,
  createTaskThunk,
  // getTasksThunk,
  deleteTaskThunk,
  Task,
} from "../thunk/taskThunk";

/* ================= STATE ================= */

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null; // ✅ ADDED
  loading: boolean;
  creating: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  selectedTask: null, // ✅ ADDED
  loading: false,
  creating: false,
  error: null,
};

/* ================= SLICE ================= */

const TaskDetails = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    /* ================= SELECT ================= */

    setSelectedTask(state, action: PayloadAction<Task | null>) {
      state.selectedTask = action.payload;
    },

    /* ================= BASIC ================= */

    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;

      // ✅ keep selectedTask in sync if exists
      if (state.selectedTask) {
        const updated = action.payload.find(
          (t) => t.id === state.selectedTask?.id,
        );
        state.selectedTask = updated || null;
      }
    },

    addTask(state, action: PayloadAction<Task>) {
      state.tasks.unshift(action.payload);
    },

    replaceTask(
      state,
      action: PayloadAction<{ tempId: string; realTask: Task }>,
    ) {
      const index = state.tasks.findIndex(
        (t) => t.id === action.payload.tempId,
      );

      if (index !== -1) {
        state.tasks[index] = action.payload.realTask;
      }

      // ✅ update selectedTask if it was temp
      if (state.selectedTask?.id === action.payload.tempId) {
        state.selectedTask = action.payload.realTask;
      }
    },

    removeTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);

      // ✅ clear selected if deleted
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    },

    updateTaskLocal(
      state,
      action: PayloadAction<Partial<Task> & { id: string }>,
    ) {
      const { id, ...changes } = action.payload;

      const task = state.tasks.find((t) => t.id === id);

      if (task) {
        Object.assign(task, changes);
      }

      // ✅ ALSO update selectedTask
      if (state.selectedTask?.id === id) {
        state.selectedTask = {
          ...state.selectedTask,
          ...changes,
        };
      }
    },
  },

  /* ================= THUNKS ================= */

  extraReducers: (builder) => {
    builder

      .addCase(createTaskThunk.pending, (state) => {
        state.creating = true;
      })
      .addCase(createTaskThunk.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createTaskThunk.rejected, (state) => {
        state.creating = false;
      })
      .addCase(createInboxTaskThunk.pending, (state) => {
        state.creating = true;
      })
      .addCase(createInboxTaskThunk.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createInboxTaskThunk.rejected, (state) => {
        state.creating = false;
      })
      /* DELETE */
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        const { taskId } = action.payload;

        state.tasks = state.tasks.filter((t) => t.id !== taskId);

        // ✅ clear selected if deleted
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
  replaceTask,
  removeTask,
  updateTaskLocal,
  setSelectedTask, // ✅ EXPORT
} = TaskDetails.actions;

export default TaskDetails.reducer;
