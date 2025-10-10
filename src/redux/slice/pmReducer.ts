import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  LotType,
  PermitType,
  PaginationParams,
  SessionsState,
} from "../../types";
import { showToast } from "../../utils";

const initialSessionState: SessionsState<PermitType> = {
  data: [],
  isLoading: false,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

interface PMState {
  permits: SessionsState<PermitType>;
  validations: SessionsState<PermitType>;
  selectedLots: LotType[];
  isCreateModalVisible: boolean;
}

const initialState: PMState = {
  permits: initialSessionState,
  validations: initialSessionState,
  selectedLots: [],
  isCreateModalVisible: false,
};

export const fetchPermits = createAsyncThunk(
  "pm/fetchPermits",
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
      const state = getState() as { pm: PMState };
      const selectedLots = state.pm.selectedLots;
      const { data: response } = await axios.post<SessionsState<PermitType>>(
        `/permit`,
        {
          ids: selectedLots.map((lot) => lot._id),
          page,
          limit,
          plateNumber,
          sortOrder,
        }
      );
      return response;
    } catch (error) {
      showToast("Failed to fetch permits", false);
      throw error;
    }
  }
);

export const fetchValidations = createAsyncThunk(
  "pm/fetchValidations",
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
      const state = getState() as { pm: PMState };
      const selectedLots = state.pm.selectedLots;
      const { data: response } = await axios.post<SessionsState<PermitType>>(
        `/permit/validation`,
        {
          ids: selectedLots.map((lot) => lot._id),
          page,
          limit,
          plateNumber,
          sortOrder,
        }
      );

      return response;
    } catch (error) {
      showToast("Failed to fetch validations", false);
      throw error;
    }
  }
);

interface CreatePermitPayload {
  name: string;
  reason: string;
  plate: string;
  paidStatus: boolean;
  lot: string;
}

export const createPermit = createAsyncThunk(
  "pm/createPermit",
  async (permit: Partial<CreatePermitPayload>) => {
    try {
      const response = await axios.post("/permit/create", permit);
      showToast("Permit created successfully", true);
      return response.data;
    } catch (error) {
      showToast("Failed to create permit", false);
      throw error;
    }
  }
);

export const deletePermit = createAsyncThunk(
  "pm/deletePermit",
  async (ids: string[]) => {
    try {
      const response = await axios.post(`/permit/delete`, { ids });
      showToast("Permit deleted successfully", true);
      return response.data;
    } catch (error) {
      showToast("Failed to delete permit", false);
      throw error;
    }
  }
);

const pmSlice = createSlice({
  name: "pm",
  initialState,
  reducers: {
    setCreateModalVisible: (state, action) => {
      state.isCreateModalVisible = action.payload;
    },
    setSelectedLots: (state, action) => {
      state.selectedLots = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermits.pending, (state) => {
        state.permits.isLoading = true;
      })
      .addCase(fetchPermits.fulfilled, (state, action) => {
        state.permits = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchPermits.rejected, (state) => {
        state.permits.isLoading = false;
      })
      .addCase(fetchValidations.pending, (state) => {
        state.validations.isLoading = true;
      })
      .addCase(fetchValidations.fulfilled, (state, action) => {
        state.validations = {
          ...action.payload,
          isLoading: false,
        };
      })
      .addCase(fetchValidations.rejected, (state) => {
        state.validations.isLoading = false;
      })
      .addCase(createPermit.fulfilled, (state) => {
        state.isCreateModalVisible = false;
      });
  },
});

export const { setCreateModalVisible, setSelectedLots } = pmSlice.actions;
export default pmSlice.reducer;
