import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    //set loading state during API calls(login, register, fetchUser)
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    //set user after successful login/ register/fetchuser
    //also store token in localStorage for persistence

    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    //Clear all auth state and remove token from localStorage
    logout: () => {
      localStorage.removeItem("token");
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    },

    updateFavourites: (state, action) => {
      if (state.user) {
        state.user.favourites = action.payload;
      }
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setUser,
  setError,
  logout,
  updateFavourites,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
