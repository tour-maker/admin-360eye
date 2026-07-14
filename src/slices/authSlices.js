import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  token: null,
};

// Safely parse token from localStorage
try {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    initialState.token = JSON.parse(storedToken);
  }
} catch (error) {
  console.error("Error parsing token from localStorage:", error);
  localStorage.removeItem("token"); // Clear invalid token
}

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setToken(state, value) {
      state.token = value.payload;
    },
  },
});

export const {setLoading, setToken } = authSlice.actions;

export default authSlice.reducer;
