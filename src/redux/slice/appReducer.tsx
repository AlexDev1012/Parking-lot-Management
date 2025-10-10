import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DriverInfoType,
  LotType,
  LprSessionType,
  PaginationParams,
  SessionsState,
  UserType,
} from "../../types";
import { showToast } from "../../utils";
import axios from "axios";
import { defaultDriverInfo } from "../../config";

export const fetchLots = createAsyncThunk("app/fetchLots", async () => {
  try {
    const { data } = await axios.get<LotType[]>(`/lot`);
    return data;
  } catch (error) {
    showToast("Error fetching lots", false);
    throw error;
  }
});

export const fetchUsers = createAsyncThunk(
  "app/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/user");
      return data;
    } catch (error) {
      showToast("Error fetching users");
      return rejectWithValue("Failed to fetch users");
    }
  }
);

export const removeUser = createAsyncThunk(
  "app/removeUser",
  async (uid: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/user/delete/${uid}`);
      showToast("User removed successfully", true);
    } catch (error) {
      showToast("Error removing user", false);
      return rejectWithValue("Failed to remove user");
    }
  }
);

export const setUserLevel = createAsyncThunk(
  "app/setUserLevel",
  async (payload: { uid: string; level: number }, { rejectWithValue }) => {
    try {
      await axios.post(`/user/set-level`, payload);
      showToast("User level set successfully", true);
    } catch (error) {
      showToast("Error setting user level");
      return rejectWithValue("Failed to set user level");
    }
  }
);

export const setUserStatus = createAsyncThunk(
  "app/setUserStatus",
  async (payload: { uid: string; status: boolean }, { rejectWithValue }) => {
    try {
      await axios.post("/user/set-status", payload);
      showToast("User status set successfully", true);
    } catch (error) {
      showToast("Error setting user status");
      return rejectWithValue("Failed to set user status");
    }
  }
);

export const fetchParkingSessions = createAsyncThunk(
  "stats/fetchParkingSessions",
  async (
    { page, limit, sortOrder, plateNumber }: PaginationParams,
    { getState }
  ) => {
    try {
      const state = getState() as { app: AppState };
      const selectedLots = state.app.lots;

      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/parkingSessions`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });

      return response;
    } catch (error) {
      showToast("Error fetching Parking Sessions", false);
      throw error;
    }
  }
);

export const handleParkingSessionDelete = createAsyncThunk(
  "app/handleParkingSessionDelete",
  async ({ item, kind }: { item: LprSessionType; kind: string }) => {
    try {
      await axios.delete(`/data/${item._id}/${kind}`);
      showToast("Delete Session Successfully", true);
    } catch (error) {
      showToast("Error deleting session", false);
      throw error;
    }
  }
);

interface AppState {
  lots: LotType[];
  users: UserType[];
  sideBarOpen: boolean;
  driverInfo: DriverInfoType;
  sessionInfo: LprSessionType | null;
  parkingSessions: SessionsState<LprSessionType>;
}

const initialSessionsState: SessionsState<LprSessionType> = {
  data: [],
  isLoading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

const initialState: AppState = {
  lots: [],
  users: [],
  sideBarOpen: true,
  driverInfo: defaultDriverInfo,
  sessionInfo: null,
  parkingSessions: initialSessionsState,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSideBarOpen: (state, action: PayloadAction<boolean>) => {
      state.sideBarOpen = action.payload;
    },
    setDriverInfo: (state, action: PayloadAction<DriverInfoType>) => {
      state.driverInfo = action.payload;
    },
    setSessionInfo: (state, action: PayloadAction<LprSessionType | null>) => {
      state.sessionInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLots.fulfilled, (state, action) => {
      state.lots = action.payload;
    });
    builder.addCase(fetchLots.rejected, (state) => {
      state.lots = [];
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state) => {
      state.users = [];
    });
    builder.addCase(fetchParkingSessions.pending, (state) => {
      state.parkingSessions.isLoading = true;
    });
    builder.addCase(fetchParkingSessions.fulfilled, (state, action) => {
      state.parkingSessions = {
        ...action.payload,
        isLoading: false,
      };
    });
    builder.addCase(fetchParkingSessions.rejected, (state) => {
      state.parkingSessions.isLoading = false;
    });
  },
});

export const { setSideBarOpen, setDriverInfo, setSessionInfo } =
  appSlice.actions;

export default appSlice.reducer;
