import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import {
  LotType,
  LprSessionType,
  PaymentSessionType,
  DriverInfoType,
  SessionsState,
} from "../../types";
import { showToast } from "../../utils";

interface PaginationParams {
  page?: number;
  limit?: number;
  plateNumber?: string;
  sortOrder?: "asc" | "desc";
}

interface PsState {
  selectedLots: LotType[];
  currentSessions: SessionsState<LprSessionType>;
  paymentSessions: SessionsState<PaymentSessionType>;
  violations: SessionsState<LprSessionType>;
  nonViolations: SessionsState<LprSessionType>;
  resolvedViolations: SessionsState<LprSessionType>;
  errorSessions: SessionsState<LprSessionType>;
  dLoading: boolean;
  pLoading: string;
}

const initialParkingState: SessionsState<LprSessionType> = {
  data: [],
  isLoading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

const initialPaymentSessionState: SessionsState<PaymentSessionType> = {
  data: [],
  isLoading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

const initialState: PsState = {
  selectedLots: [],
  currentSessions: initialParkingState,
  paymentSessions: initialPaymentSessionState,
  violations: initialParkingState,
  nonViolations: initialParkingState,
  resolvedViolations: initialParkingState,
  errorSessions: initialParkingState,
  dLoading: false,
  pLoading: "",
};

// Separate thunks for each session type
export const fetchCurrentSessions = createAsyncThunk(
  "ps/fetchCurrentSessions",
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
      const state = getState() as { ps: PsState };
      const selectedLots = state.ps.selectedLots;

      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/currentSessions`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });

      return response;
    } catch (error) {
      showToast("Error fetching LPR Sessions", false);
      throw error;
    }
  }
);

export const fetchPaymentSessions = createAsyncThunk(
  "ps/fetchPaymentSessions",
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
      const state = getState() as { ps: PsState };
      const selectedLots = state.ps.selectedLots;

      const { data: response } = await axios.post<
        SessionsState<PaymentSessionType>
      >(`/payment`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });

      return response;
    } catch (error) {
      showToast("Error fetching Payment Sessions", false);
      throw error;
    }
  }
);

export const fetchNonViolations = createAsyncThunk(
  "ps/fetchNonViolations",
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
      const state = getState() as { ps: PsState };
      const selectedLots = state.ps.selectedLots;

      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/non-violations`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });

      return response;
    } catch (error) {
      showToast("Error fetching Non Violations", false);
      throw error;
    }
  }
);

export const fetchResolvedViolations = createAsyncThunk(
  "ps/fetchResolvedViolations",
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
      const state = getState() as { ps: PsState };
      const selectedLots = state.ps.selectedLots;
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

export const fetchViolations = createAsyncThunk(
  "ps/fetchViolations",
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
      const state = getState() as { ps: PsState };
      const selectedLots = state.ps.selectedLots;

      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/violations`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });

      return response;
    } catch (error) {
      showToast("Error fetching Violations", false);
      throw error;
    }
  }
);

export const fetchErrorSessions = createAsyncThunk(
  "ps/fetchErrorSessions",
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
      const state = getState() as { ps: PsState };
      const selectedLots = state.ps.selectedLots;

      const { data: response } = await axios.post<
        SessionsState<LprSessionType>
      >(`/data/errors`, {
        ids: selectedLots.map((lot) => lot._id),
        page,
        limit,
        plateNumber,
        sortOrder,
      });

      return response;
    } catch (error) {
      showToast("Error fetching Error Sessions", false);
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
}

export const handleParkingSessionUpdate = createAsyncThunk(
  "ps/handleParkingSessionUpdate",
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
  "ps/handleParkingSessionDelete",
  async (currentSessions: LprSessionType[]) => {
    try {
      await axios.post(`/data/delete`, {
        ids: currentSessions.map((ls) => ls._id),
      });
      showToast("Delete Session Successfully", true);
    } catch (error) {
      showToast("Error deleting session", false);
      throw error;
    }
  }
);

interface PaymentSessionUpdateParams {
  _id: string;
  plateNumber?: string;
  purchasedDate?: string;
  expirationDate?: string;
  chargedAmount?: number;
}

export const handlePaymentSessionUpdate = createAsyncThunk(
  "ps/handlePaymentSessionUpdate",
  async (item: PaymentSessionUpdateParams) => {
    try {
      await axios.put(`/payment/${item._id}`, item);
      showToast("Session updated successfully", true);
    } catch (error) {
      showToast("Error updating session", false);
      throw error;
    }
  }
);

export const handlePaymentSessionDelete = createAsyncThunk(
  "ps/handlePaymentSessionDelete",
  async (paymentSessions: PaymentSessionType[]) => {
    try {
      await axios.post(`/payment/delete`, {
        ids: paymentSessions.map((ps) => ps._id),
      });
      showToast("Delete Session Successfully", true);
    } catch (error) {
      showToast("Error deleting session", false);
      throw error;
    }
  }
);

export const handleDriverInfoCreate = createAsyncThunk(
  "ps/handleDriverInfoCreate",
  async (item: DriverInfoType) => {
    try {
      await axios.post(`/driver`, item);
      showToast("Driver Info created successfully", true);
    } catch (error) {
      showToast("Error creating driver info", false);
      throw error;
    }
  }
);

export const psSlice = createSlice({
  name: "ps",
  initialState,
  reducers: {
    setSelectedLots: (state, action: PayloadAction<LotType[]>) => {
      state.selectedLots = action.payload;
    },
    setPLoading: (state, action: PayloadAction<string>) => {
      state.pLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // LPR Sessions
      .addCase(fetchCurrentSessions.pending, (state) => {
        state.currentSessions.isLoading = true;
      })
      .addCase(fetchCurrentSessions.fulfilled, (state, action) => {
        state.currentSessions = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchCurrentSessions.rejected, (state) => {
        state.currentSessions.isLoading = false;
      })
      // Error Sessions
      .addCase(fetchErrorSessions.pending, (state) => {
        state.errorSessions.isLoading = true;
      })
      .addCase(fetchErrorSessions.fulfilled, (state, action) => {
        state.errorSessions = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchErrorSessions.rejected, (state) => {
        state.errorSessions.isLoading = false;
      })
      // Violations
      .addCase(fetchViolations.pending, (state) => {
        state.violations.isLoading = true;
      })
      .addCase(fetchViolations.fulfilled, (state, action) => {
        state.violations = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchViolations.rejected, (state) => {
        state.violations.isLoading = false;
      })
      // Non-Violations
      .addCase(fetchNonViolations.pending, (state) => {
        state.nonViolations.isLoading = true;
      })
      .addCase(fetchNonViolations.fulfilled, (state, action) => {
        state.nonViolations = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchNonViolations.rejected, (state) => {
        state.nonViolations.isLoading = false;
      })
      // Paid Sessions
      .addCase(fetchPaymentSessions.pending, (state) => {
        state.paymentSessions.isLoading = true;
      })
      .addCase(fetchPaymentSessions.fulfilled, (state, action) => {
        state.paymentSessions = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchPaymentSessions.rejected, (state) => {
        state.paymentSessions.isLoading = false;
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
      });
  },
});

export const { setSelectedLots, setPLoading } = psSlice.actions;

export default psSlice.reducer;
