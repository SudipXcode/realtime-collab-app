import { createSlice } from "@reduxjs/toolkit";
interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  providers: string[];
  isPro: boolean;
}
interface ProfileState {
  isProfileOpen: boolean;
  profile: ProfileData | null;
}

const initialState: ProfileState = {
  isProfileOpen: false,
  profile: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    openProfile(state, action: PayloadAction<ProfileData>) {
      state.isProfileOpen = true;
      state.profile = action.payload;
    },
    closeProfile(state) {
      state.isProfileOpen = false;
    },
  },
});

export const { openProfile, closeProfile } = profileSlice.actions;

export default profileSlice.reducer;
