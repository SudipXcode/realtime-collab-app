import { createSlice } from "@reduxjs/toolkit";

interface listState {
  isListOpen: boolean;
}

const initialState: listState = {
  isListOpen: false,
};

const listSlice = createSlice({
  name: "list",
  initialState,
  reducers: {
    openList(state) {
      state.isListOpen = true;
    },
    closeList(state) {
      state.isListOpen = false;
    },
  },
});

export const { openList, closeList } = listSlice.actions;

export default listSlice.reducer;
