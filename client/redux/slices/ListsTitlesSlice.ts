// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { apiCall } from "@/lib/apiCall";

// // =============================
// // ✅ FETCH LISTS
// // =============================
// export const fetchLists = createAsyncThunk(
//   "lists/fetch",
//   async () => {
//     const res = await apiCall<TaskType[]>("/api/lists/", {
//       method: "GET",
//     });

//     return res;
//   }
// );

// // =============================
// // ✅ INITIAL STATE TYPE
// // =============================
// interface ListsState {
//   data: TaskType[];
//   loading: boolean;
// }

// const initialState: ListsState = {
//   data: [],
//   loading: false,
// };

// // =============================
// // ✅ SLICE
// // =============================
// const listsTitlesSlice = createSlice({
//   name: "listsTitle",
//   initialState,
//   reducers: {
//     // 🔥 REMOVE LISTS (used after delete)
//     removeLists: (state, action: PayloadAction<string[]>) => {
//       const ids = action.payload;

//       state.data = state.data.filter((item) => !ids.includes(item.id));
//     },

//     // 🔥 ADD LIST (used after create)
//     addList: (state, action: PayloadAction<TaskType>) => {
//       const newList = action.payload;

//       // avoid duplicate
//       if (state.data.some((item) => item.id === newList.id)) return;

//       state.data.unshift(newList);
//     },

//     // 🔥 UPDATE FAVOURITE (optional but useful)
//     updateFavourite: (
//       state,
//       action: PayloadAction<{ id: string; isFavourite: boolean }>
//     ) => {
//       const { id, isFavourite } = action.payload;

//       const item = state.data.find((i) => i.id === id);
//       if (item) {
//         item.isFavourite = isFavourite;
//       }
//     },
//   },

//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchLists.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchLists.fulfilled, (state, action) => {
//         state.loading = false;
//         state.data = action.payload || [];
//       })
//       .addCase(fetchLists.rejected, (state) => {
//         state.loading = false;
//       });
//   },
// });

// // =============================
// // ✅ EXPORT ACTIONS
// // =============================
// export const { removeLists, addList, updateFavourite } =
//   listsTitlesSlice.actions;

// // =============================
// // ✅ EXPORT REDUCER
// // =============================
// export default listsTitlesSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiCall } from "@/lib/apiCall";

/* ================= TYPES ================= */

export interface TaskType {
  id: string;
  name: string; // ✅ correct
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
      const list = state.data.find((l) => l.id === action.payload.id);
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
