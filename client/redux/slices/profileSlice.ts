
import { createSlice } from "@reduxjs/toolkit";

interface ProfileState {
  isProfileOpen: boolean;
}

const initialState: ProfileState = {
  isProfileOpen: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    openProfile(state) {
      state.isProfileOpen = true;
    },
    closeProfile(state) {
      state.isProfileOpen = false;
    },
  },
});

export const { openProfile, closeProfile } = profileSlice.actions;
export default profileSlice.reducer;