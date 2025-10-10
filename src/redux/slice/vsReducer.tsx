import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  LotType,
  LprSessionType,
  DriverInfoType,
  PaginationParams,
  SessionsState,
} from "../../types";
import { showToast } from "../../utils";

interface VsState {
  selectedLots: LotType[];
  recentViolations: SessionsState<LprSessionType>;
  dueViolations: SessionsState<LprSessionType>;
  overdueViolations: SessionsState<LprSessionType>;
  mistakeViolations: SessionsState<LprSessionType>;
  resolvedViolations: SessionsState<LprSessionType>;
  dLoading: boolean;
  pLoading: boolean;
}

const initialSessionState: SessionsState<LprSessionType> = {
  data: [],
  isLoading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

const initialState: VsState = {
  selectedLots: [],
  recentViolations: initialSessionState,
  dueViolations: initialSessionState,
  overdueViolations: initialSessionState,
  mistakeViolations: initialSessionState,
  resolvedViolations: initialSessionState,
  dLoading: false,
  pLoading: false,
};

// Separate thunks for each session type
export const fetchRecentViolations = createAsyncThunk(
  "vs/fetchRecentViolations",
  async (
    {
      page = 1,
      limit = 10,
      plateNumber = "",
      sortOrder = "desc",
    }: PaginationParams,
    { getState }
  ) => {
    try {
      const state = getState() as { vs: VsState };
      const selectedLots = state.vs.selectedLots;
      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/recent-violations`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });
      return response;
    } catch (error) {
      showToast("Error fetching Recent Violations", false);
      throw error;
    }
  }
);

export const fetchDueViolations = createAsyncThunk(
  "vs/fetchDueViolations",
  async (
    {
      page = 1,
      limit = 10,
      plateNumber = "",
      sortOrder = "desc",
    }: PaginationParams,
    { getState }
  ) => {
    try {
      const state = getState() as { vs: VsState };
      const selectedLots = state.vs.selectedLots;
      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/due-violations`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });
      return response;
    } catch (error) {
      showToast("Error fetching Due Violations", false);
      throw error;
    }
  }
);

export const fetchOverdueViolations = createAsyncThunk(
  "vs/fetchOverdueViolations",
  async (
    {
      page = 1,
      limit = 10,
      plateNumber = "",
      sortOrder = "desc",
    }: PaginationParams,
    { getState }
  ) => {
    try {
      const state = getState() as { vs: VsState };
      const selectedLots = state.vs.selectedLots;
      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/overdue-violations`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });
      return response;
    } catch (error) {
      showToast("Error fetching Overdue Violations", false);
      throw error;
    }
  }
);

export const fetchResolvedViolations = createAsyncThunk(
  "vs/fetchResolvedViolations",
  async (
    {
      page = 1,
      limit = 10,
      plateNumber = "",
      sortOrder = "desc",
    }: PaginationParams,
    { getState }
  ) => {
    try {
      const state = getState() as { vs: VsState };
      const selectedLots = state.vs.selectedLots;
      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/resolved-violations`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });
      return response;
    } catch (error) {
      showToast("Error fetching Resolved Violations", false);
      throw error;
    }
  }
);

interface UpdateSessionParams {
  _id: string;
  plateNumber?: string;
  country?: string;
  entryTime?: string;
  exitTime?: string;
  fine?: number;
  printedAt?: string;
  status?: string;
}

export const handleParkingSessionUpdate = createAsyncThunk(
  "vs/handleParkingSessionUpdate",
  async (item: UpdateSessionParams) => {
    try {
      await axios.put(`/data/${item._id}`, item);
      showToast("Session updated successfully", true);
    } catch (error) {
      showToast("Error updating session", false);
      throw error;
    }
  }
);

export const handleParkingSessionDelete = createAsyncThunk(
  "vs/handleParkingSessionDelete",
  async (lprSessions: LprSessionType[]) => {
    try {
      await axios.post(`/data/delete`, {
        ids: lprSessions.map((ls) => ls._id),
      });
      showToast("Delete Session Successfully", true);
    } catch (error) {
      showToast("Error deleting session", false);
      throw error;
    }
  }
);

export const handleDriverInfoUpdate = createAsyncThunk(
  "vs/handleDriverInfoUpdate",
  async (item: DriverInfoType) => {
    try {
      await axios.post(`/driver`, item);
      showToast("Driver Info updated successfully", true);
    } catch (error) {
      showToast("Error updating driver info", false);
      throw error;
    }
  }
);

export const fetchMistakeViolations = createAsyncThunk(
  "vs/fetchMistakeViolations",
  async (
    {
      page = 1,
      limit = 10,
      plateNumber = "",
      sortOrder = "desc",
    }: PaginationParams,
    { getState }
  ) => {
    try {
      const state = getState() as { vs: VsState };
      const selectedLots = state.vs.selectedLots;
      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/mistake-violations`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });
      return response;
    } catch (error) {
      showToast("Error fetching Mistake Violations", false);
      throw error;
    }
  }
);

export const vsSlice = createSlice({
  name: "vs",
  initialState,
  reducers: {
    setSelectedLots: (state, action: PayloadAction<LotType[]>) => {
      state.selectedLots = action.payload;
    },
    setPLoading: (state, action: PayloadAction<boolean>) => {
      state.pLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Recent Violations
      .addCase(fetchRecentViolations.pending, (state) => {
        state.recentViolations.isLoading = true;
      })
      .addCase(fetchRecentViolations.fulfilled, (state, action) => {
        state.recentViolations = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchRecentViolations.rejected, (state) => {
        state.recentViolations.isLoading = false;
      })
      // Due Violations
      .addCase(fetchDueViolations.pending, (state) => {
        state.dueViolations.isLoading = true;
      })
      .addCase(fetchDueViolations.fulfilled, (state, action) => {
        state.dueViolations = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchDueViolations.rejected, (state) => {
        state.dueViolations.isLoading = false;
      })
      // Overdue Violations
      .addCase(fetchOverdueViolations.pending, (state) => {
        state.overdueViolations.isLoading = true;
      })
      .addCase(fetchOverdueViolations.fulfilled, (state, action) => {
        state.overdueViolations = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchOverdueViolations.rejected, (state) => {
        state.overdueViolations.isLoading = false;
      })
      // Resolved Violations
      .addCase(fetchResolvedViolations.pending, (state) => {
        state.resolvedViolations.isLoading = true;
      })
      .addCase(fetchResolvedViolations.fulfilled, (state, action) => {
        state.resolvedViolations = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchResolvedViolations.rejected, (state) => {
        state.resolvedViolations.isLoading = false;
      })
      // Delete Session
      .addCase(handleParkingSessionDelete.pending, (state) => {
        state.dLoading = true;
      })
      .addCase(handleParkingSessionDelete.fulfilled, (state) => {
        state.dLoading = false;
      })
      .addCase(handleParkingSessionDelete.rejected, (state) => {
        state.dLoading = false;
      })
      // Update Driver Info
      .addCase(handleDriverInfoUpdate.pending, (state) => {
        state.dLoading = true;
      })
      .addCase(handleDriverInfoUpdate.fulfilled, (state) => {
        state.dLoading = false;
      })
      .addCase(handleDriverInfoUpdate.rejected, (state) => {
        state.dLoading = false;
      })
      // Mistake Violations
      .addCase(fetchMistakeViolations.pending, (state) => {
        state.mistakeViolations.isLoading = true;
      })
      .addCase(fetchMistakeViolations.fulfilled, (state, action) => {
        state.mistakeViolations = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchMistakeViolations.rejected, (state) => {
        state.mistakeViolations.isLoading = false;
      });
  },
});

export const { setSelectedLots, setPLoading } = vsSlice.actions;

export default vsSlice.reducer;
