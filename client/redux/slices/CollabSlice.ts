// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface CollabMember {
//   id: number;
//   name: string;
//   email: string;
//   img: string;
//   isOwner: boolean;

// }

// interface CollabState {
//   isCollabOpen: boolean;
//   collabMembers: CollabMember[];
//   listId: number | null;
// }

// const initialState: CollabState = {
//   isCollabOpen: false,
//   collabMembers: [],
//   listId: null,
// };

// const collabSlice = createSlice({
//   name: "collab",
//   initialState,
//   reducers: {
//     openCollab(state, action: PayloadAction<{ members: CollabMember[]; listId: number }>) {
//       state.isCollabOpen = true;
//       state.collabMembers = action.payload.members;
//       state.listId = action.payload.listId;
//     },
//     closeCollab(state) {
//       state.isCollabOpen = false;
//       state.collabMembers = [];
//       state.listId = null;
//     },
//   },
// });

// export const { openCollab, closeCollab } = collabSlice.actions;
// export default collabSlice.reducer;
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* ================= TYPES ================= */

interface CollabMember {
  id: string;
  name: string;
  email: string;
  img: string;
}

interface Owner {
  id: string;
  name: string;
  email: string;
  img: string;
}

interface CollabState {
  isCollabOpen: boolean;
  collabMembers: CollabMember[];
  owner: Owner | null;
  listId: number | null;
  isowner: boolean;
}

/* ================= INITIAL ================= */

const initialState: CollabState = {
  isCollabOpen: false,
  collabMembers: [], // ✅ MUST be array
  owner: null,
  listId: null,
  isowner: false, // ✅ boolean, not null
};
/* ================= SLICE ================= */

const collabSlice = createSlice({
  name: "collab",
  initialState,
  reducers: {
    openCollab(
      state,
      action: PayloadAction<{
        owner: Owner;
        members: CollabMember[];
        listId: number;
        isowner: any;
      }>,
    ) {
      state.isCollabOpen = true;
      state.collabMembers = action.payload.members;
      state.owner = action.payload.owner;
      state.listId = action.payload.listId;
      state.isowner = action.payload.isowner;
    },

    closeCollab(state) {
      state.isCollabOpen = false;
      state.collabMembers = null;
      state.owner = null;
      state.listId = null;
      state.isowner = null;
    },
  },
});

export const { openCollab, closeCollab } = collabSlice.actions;
export default collabSlice.reducer;
