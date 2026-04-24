import { createSlice } from "@reduxjs/toolkit";

interface payState {
  isPayOpen: boolean;
}

const initialState: payState = {
  isPayOpen: false,
};

const paySlice = createSlice({
  name: "pay",
  initialState,
  reducers: {
    openPay(state) {
      state.isPayOpen = true;
    },
    closePay(state) {
      state.isPayOpen = false;
    },
  },
});

export const { openPay, closePay } = paySlice.actions;

export default paySlice.reducer;
