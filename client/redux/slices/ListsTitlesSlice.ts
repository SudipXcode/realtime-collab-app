
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiCall } from "@/lib/apiCall";

/* ================= TYPES ================= */

export interface TaskType {
  id: string;
  name: string; // ✅ correct
    isFavourite: boolean;
}

/* ================= FETCH ================= */

export const fetchLists = createAsyncThunk("lists/fetch", async () => {
  const res = await apiCall<{ data: TaskType[] }>("/api/lists/", {
    method: "GET",
  });

  return res.data; // ✅ now correct
});

/* ================= STATE ================= */

interface ListsState {
  data: TaskType[];
  loading: boolean;
  loaded: boolean; // ✅ IMPORTANT
}

const initialState: ListsState = {
  data: [],
  loading: false,
  loaded: false,
};

/* ================= SLICE ================= */

const listsTitlesSlice = createSlice({
  name: "listsTitle",
  initialState,
  reducers: {
    /* ===== CREATE ===== */
    addList: (state, action: PayloadAction<TaskType>) => {
      if (!Array.isArray(state.data)) {
        state.data = [];
      }

      const exists = state.data.some((l) => l.id === action.payload.id);

      if (!exists) {
        state.data.unshift(action.payload);
      }
    },

    /* ===== DELETE ===== */
    removeLists: (state, action: PayloadAction<string[]>) => {
      state.data = state.data.filter((l) => !action.payload.includes(l.id));
    },

    /* ===== UPDATE (GENERIC) ===== */
    updateList: (
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<TaskType>;
      }>,
    ) => {
      const { id, changes } = action.payload;
      const list = state.data.find((l) => l.id === id);

      if (list) {
        Object.assign(list, changes);
      }
    },

    /* ===== OPTIONAL ===== */
    updateFavourite: (
      state,
      action: PayloadAction<{ id: string; isFavourite: boolean }>,
    ) => {
      const list = state.data.find((l: any) => l.id === action.payload.id);
      if (list) {
        list.isFavourite = action.payload.isFavourite;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true; // ✅ only once
        state.data = action.payload || [];
      })
      .addCase(fetchLists.rejected, (state) => {
        state.loading = false;
      });
  },
});

/* ================= EXPORTS ================= */

export const { addList, removeLists, updateList, updateFavourite } =
  listsTitlesSlice.actions;

export default listsTitlesSlice.reducer;
