import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface Owner {
  email: string;
  name: string;
  picture: string;
  id: string;
}
interface ShareState {
  isShareOpen: boolean;
  listId: string;
  title: string;
  owner: Owner;

}

const initialState: ShareState = {
  isShareOpen: false,
  listId: null,
  title: null,
  owner: null,
  isOwner: null,
};

const shareSlice = createSlice({
  name: "share",
  initialState,
  reducers: {
    openShare(
      state,
      action: PayloadAction<{
        id: number;
        title: string;
        owner: Owner;

      }>,
    ) {
      state.isShareOpen = true;
      state.listId = action.payload.id;
      state.title = action.payload.title;
      state.owner = action.payload.owner;
     
    },
    closeShare(state) {
      state.isShareOpen = false;
      state.listId = null;
      state.title = null;
      state.owner = null;
  
    },
  },
});

export const { openShare, closeShare } = shareSlice.actions;
export default shareSlice.reducer;
