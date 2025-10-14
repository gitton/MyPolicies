// Redux slice for managing authentication state

import { User } from "@/types/User";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  loading: boolean;
  user: User | null;
}

const initialState: AuthState = {
  loading: true,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;
