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
  auth_provider?: string;
  profile_picture?: string;
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

// New OAuth login thunk
export const initiateOAuthLogin = createAsyncThunk(
  "auth/oauthLogin",
  async (provider: string, { rejectWithValue }) => {
    try {
      // Redirect to OAuth provider
      window.location.href = `http://127.0.0.1:5000/auth/login/${provider}`;
      // This thunk doesn't return anything since we're redirecting
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Handle OAuth callback (when user returns from OAuth provider)
export const handleOAuthCallback = createAsyncThunk(
  "auth/oauthCallback",
  async (_, { rejectWithValue }) => {
    try {
      // Check if we have a token in cookies after OAuth redirect
      const token = Cookies.get("access_token");

      if (!token) {
        throw new Error("No access token found after OAuth login");
      }

      // Store token in localStorage as backup
      localStorage.setItem("access_token", token);

      // Get user information
      const response = await api.get("/auth/checkAuth", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data as User;
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
      Cookies.remove("access_token");
      return null;
    } catch (error: any) {
      // Still clear the token on error
      localStorage.removeItem("access_token");
      Cookies.remove("access_token");
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
    oauthLoading: false,
  },
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
    setOAuthLoading: (state, action) => {
      state.oauthLoading = action.payload;
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
      })
      // OAuth cases
      .addCase(initiateOAuthLogin.pending, (state) => {
        state.oauthLoading = true;
        state.error = null;
      })
      .addCase(initiateOAuthLogin.rejected, (state, action) => {
        state.oauthLoading = false;
        state.error = action.payload as string | null;
      })
      .addCase(handleOAuthCallback.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.oauthLoading = false;
      })
      .addCase(handleOAuthCallback.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string | null;
        state.isAuthenticated = false;
        state.oauthLoading = false;
      });
  },
});

export const { resetAuthError, setOAuthLoading } = authSlice.actions;
export default authSlice.reducer;
