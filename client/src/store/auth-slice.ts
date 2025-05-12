import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

interface Credentials {
  email: string;
  password: string;
  username?: string;
}
interface User {
  id: string;
  username: string;
  email: string;
}

// Create a reusable axios instance with common config
const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      // Get token from localStorage as fallback
      const token =
        localStorage.getItem("access_token") || Cookies.get("access_token");

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await api.get("/auth/checkAuth", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      return response.data as User;
    } catch (error: any) {
      // Don't trigger failure state for 401 errors during initial load
      if (error.response?.status === 401) {
        return null;
      }

      const message =
        error.response?.data?.message ||
        error.message ||
        "Authentication check failed";
      return rejectWithValue(message);
    }
  }
);
export const registerUser = createAsyncThunk(
  "auth/register",
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("auth/register", credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: Credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("auth/login", credentials, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      // Store token in localStorage as a backup
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
      }

      return response.data; // This should include user information
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem("access_token");

      // Send the token in the Authorization header
      await api.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear the token
      localStorage.removeItem("access_token");
      return null;
    } catch (error: any) {
      // Still clear the token on error
      localStorage.removeItem("access_token");
      return rejectWithValue(error.message);
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as User | null,
    isAuthenticated: false,
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string | null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string | null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string | null;
      })
      .addCase(registerUser.pending, (state) => {
        (state.status = "loading"), (state.error = null);
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { resetAuthError } = authSlice.actions;
export default authSlice.reducer;
