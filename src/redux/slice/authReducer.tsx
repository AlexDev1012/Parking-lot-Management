import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signOut, User } from "firebase/auth";
import axios from "axios";
import { auth } from "../../services/firebase";

interface SanitizedUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  tenantId: string | null;
  customClaims: {
    level: number;
  };
  metadata: {
    lastSignInTime: string;
  };
}

interface AuthState {
  user: SanitizedUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
};

const sanitizeUser = (user: User | null): SanitizedUser | null => {
  if (!user) return null;

  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    tenantId: user.tenantId,
    customClaims: { level: 0 },
    metadata: {
      lastSignInTime: user.metadata.lastSignInTime || "",
    },
  };
};

export const handleAuthorize = createAsyncThunk(
  "auth/handleAuthorize",
  async (user: User | null) => {
    if (user && user.emailVerified) {
      const idTokenResult = await user.getIdTokenResult();
      const level: number = idTokenResult.claims.level as number;

      // Set axios defaults
      const token = await user.getIdToken();
      axios.defaults.headers.common["token"] = token;
      axios.defaults.baseURL = import.meta.env.VITE_API_BACKEND_URL;

      const sanitizedUser = sanitizeUser(user);
      if (sanitizedUser) {
        sanitizedUser.customClaims = { level };
      }
      return sanitizedUser;
    } else {
      if (user && !user.emailVerified) {
        throw new Error("please-verify-mail");
      }
      return null;
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await signOut(auth);
  console.log("User has successfully signed out.");
  return null;
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleAuthorize.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleAuthorize.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
        state.error = null;
      })
      .addCase(handleAuthorize.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Authentication failed";
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        // Clear axios defaults when logging out
        delete axios.defaults.headers.common["token"];
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.error.message || "Logout failed";
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
