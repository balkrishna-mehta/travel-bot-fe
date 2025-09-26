import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "@/types/auth.types";
import {
  login as loginApi,
  refreshToken,
  logout as logoutApi,
  getCurrentUser,
  setRefreshToken,
  getRefreshToken,
  clearRefreshToken,
} from "@/api/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to prevent API calls before auth init
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await loginApi(credentials);

      // Store refresh token in cookie (for middleware access)
      setRefreshToken(response.refresh_token);

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  }
);

export const refreshUserToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshToken();
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Token refresh failed"
      );
    }
  }
);

export const fetchUserData = createAsyncThunk(
  "auth/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const userData = await getCurrentUser();
      return {
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user data"
      );
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutApi();
  } catch (error) {
    console.error("Logout API call failed:", error);
  } finally {
    clearRefreshToken();
  }
});

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const refreshTokenValue = getRefreshToken();

      if (refreshTokenValue) {
        // Try to refresh the token
        const refreshResponse = await dispatch(refreshUserToken());
        if (refreshUserToken.fulfilled.match(refreshResponse)) {
          // After successful token refresh, fetch user data
          const userResponse = await dispatch(fetchUserData());
          if (fetchUserData.fulfilled.match(userResponse)) {
            return {
              accessToken: refreshResponse.payload.access_token,
              user: userResponse.payload,
            };
          }
        }
      }
      return null;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Auth initialization failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      clearRefreshToken();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh token
      .addCase(refreshUserToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.access_token;
        state.isAuthenticated = !!state.user && !!action.payload.access_token;
      })
      .addCase(refreshUserToken.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        clearRefreshToken();
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.user = action.payload.user;
          state.isAuthenticated =
            !!action.payload.user && !!action.payload.accessToken;
        } else {
          // No refresh token or refresh failed, user needs to login
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        clearRefreshToken();
      })
      // Fetch user data
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload && !!state.accessToken;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
