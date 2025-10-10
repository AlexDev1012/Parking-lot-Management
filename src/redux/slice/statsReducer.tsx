import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  LprSessionType,
  PaginationParams,
  PaymentSessionType,
  PermitType,
  SessionsState,
} from "../../types";

interface ParkingPortalStats {
  parkingSessions: {
    [key: string]: number; // month name -> count
  };

  violations: {
    [key: string]: number; // month name -> count
  };
  isLoading: boolean;
}

interface PaidPortalStats {
  paymentSessions: {
    [key: string]: number; // month name -> count
  };
  isLoading: boolean;
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

const initialPermitsState: SessionsState<PermitType> = {
  data: [],
  isLoading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

const initialPaymentSessionsState: SessionsState<PaymentSessionType> = {
  data: [],
  isLoading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};
interface StatsState {
  parkingPortalStats: ParkingPortalStats;
  paidPortalStats: PaidPortalStats;
  isLoading: boolean;
  SearchResults: {
    parkingSessions: SessionsState<LprSessionType>;
    paymentSessions: SessionsState<PaymentSessionType>;
    permits: SessionsState<PermitType>;
    isLoading: boolean;
  };
}

const initialState: StatsState = {
  parkingPortalStats: {
    parkingSessions: {},
    violations: {},
    isLoading: false,
  },
  paidPortalStats: {
    paymentSessions: {},
    isLoading: false,
  },
  SearchResults: {
    parkingSessions: initialSessionsState,
    paymentSessions: initialPaymentSessionsState,
    permits: initialPermitsState,
    isLoading: false,
  },
  isLoading: false,
};

interface FetchPortalStats {
  year: number;
  lotIds: string[];
}

export const fetchParkingPortalStats = createAsyncThunk(
  "stats/fetchParkingPortalStats",
  async ({ year, lotIds }: FetchPortalStats) => {
    try {
      const response = await axios.post(`/statistics/parking-portal`, {
        lotIds,
        year,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching portal stats:", error);
      throw error;
    }
  }
);

export const fetchPaidPortalStats = createAsyncThunk(
  "stats/fetchPaidPortalStats",
  async ({ year, lotIds }: FetchPortalStats) => {
    try {
      const response = await axios.post(`/statistics/paid-portal`, {
        lotIds,
        year,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching portal stats:", error);
      throw error;
    }
  }
);

export const fetchByPlateNumberForLpr = createAsyncThunk(
  "stats/fetchByPlateNumberForLpr",
  async ({ plateNumber, page, limit, sortOrder }: PaginationParams) => {
    try {
      const { data: parkingSessions } = await axios.post<
        SessionsState<LprSessionType>
      >(`/statistics/search/lpr`, {
        plateNumber: plateNumber || "",
        page: page || 1,
        limit: limit || 10,
        sortOrder: sortOrder || "desc",
      });

      return parkingSessions;
    } catch (error) {
      console.error("Error fetching by plate number:", error);
      throw error;
    }
  }
);

export const fetchByPlateNumberForPayment = createAsyncThunk(
  "stats/fetchByPlateNumberForPayment",
  async ({ plateNumber, page, limit, sortOrder }: PaginationParams) => {
    try {
      const { data: paymentSessions } = await axios.post<
        SessionsState<PaymentSessionType>
      >(`/statistics/search/payment`, {
        plateNumber: plateNumber || "",
        page: page || 1,
        limit: limit || 10,
        sortOrder: sortOrder || "desc",
      });

      return paymentSessions;
    } catch (error) {
      console.error("Error fetching by plate number:", error);
      throw error;
    }
  }
);

export const fetchByPlateNumberForPermit = createAsyncThunk(
  "stats/fetchByPlateNumberForPermit",
  async ({ plateNumber, page, limit, sortOrder }: PaginationParams) => {
    try {
      const { data: permits } = await axios.post<SessionsState<PermitType>>(
        `/statistics/search/permit`,
        {
          plateNumber: plateNumber || "",
          page: page || 1,
          limit: limit || 10,
          sortOrder: sortOrder || "desc",
        }
      );

      return permits;
    } catch (error) {
      console.error("Error fetching by plate number:", error);
      throw error;
    }
  }
);

export const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    clearPortalStats: (state) => {
      state.parkingPortalStats = initialState.parkingPortalStats;
      state.paidPortalStats = initialState.paidPortalStats;
    },
    clearSearchResults: (state) => {
      state.SearchResults = initialState.SearchResults;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchParkingPortalStats.pending, (state) => {
        state.parkingPortalStats.isLoading = true;
      })

      .addCase(fetchParkingPortalStats.fulfilled, (state, action) => {
        state.parkingPortalStats = {
          ...action.payload,
          isLoading: false,
        };
      })

      .addCase(fetchParkingPortalStats.rejected, (state) => {
        state.parkingPortalStats = {
          ...initialState.parkingPortalStats,
          isLoading: false,
        };
      })

      .addCase(fetchPaidPortalStats.pending, (state) => {
        state.paidPortalStats.isLoading = true;
      })

      .addCase(fetchPaidPortalStats.fulfilled, (state, action) => {
        state.paidPortalStats = {
          ...action.payload,
          isLoading: false,
        };
      })

      .addCase(fetchPaidPortalStats.rejected, (state) => {
        state.paidPortalStats = {
          ...initialState.paidPortalStats,
          isLoading: false,
        };
      })

      .addCase(fetchByPlateNumberForLpr.pending, (state) => {
        state.SearchResults.parkingSessions.isLoading = true;
      })

      .addCase(fetchByPlateNumberForLpr.fulfilled, (state, action) => {
        state.SearchResults.parkingSessions = action.payload;
        state.SearchResults.parkingSessions.isLoading = false;
      })

      .addCase(fetchByPlateNumberForLpr.rejected, (state) => {
        state.SearchResults.parkingSessions = initialSessionsState;
        state.SearchResults.parkingSessions.isLoading = false;
      })

      .addCase(fetchByPlateNumberForPayment.pending, (state) => {
        state.SearchResults.paymentSessions.isLoading = true;
      })

      .addCase(fetchByPlateNumberForPayment.fulfilled, (state, action) => {
        state.SearchResults.paymentSessions = action.payload;
        state.SearchResults.paymentSessions.isLoading = false;
      })

      .addCase(fetchByPlateNumberForPayment.rejected, (state) => {
        state.SearchResults.paymentSessions = initialPaymentSessionsState;
        state.SearchResults.paymentSessions.isLoading = false;
      })

      .addCase(fetchByPlateNumberForPermit.pending, (state) => {
        state.SearchResults.permits.isLoading = true;
      })

      .addCase(fetchByPlateNumberForPermit.fulfilled, (state, action) => {
        state.SearchResults.permits = action.payload;
        state.SearchResults.permits.isLoading = false;
      })

      .addCase(fetchByPlateNumberForPermit.rejected, (state) => {
        state.SearchResults.permits = initialPermitsState;
        state.SearchResults.permits.isLoading = false;
      });
  },
});

export const { clearPortalStats, clearSearchResults } = statsSlice.actions;

export default statsSlice.reducer;
