import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LotType, LocationType, ZoneType } from "../../types";
import axios from "axios";
import { showToast } from "../../utils";

interface LotState {
  lots: any;
  locations: LocationType[];
  zones: ZoneType[];
  selectedLot: LotType | null;
  isCreateModalVisible: boolean;
  isEditModalVisible: boolean;
  loading: {
    locations: boolean;
    zones: boolean;
  };
  error: {
    locations: string | null;
    zones: string | null;
  };
}

const initialState: LotState = {
  lots:[],
  locations: [],
  zones: [],
  selectedLot: null,
  isCreateModalVisible: false,
  isEditModalVisible: false,
  loading: {
    locations: false,
    zones: false,
  },

  error: {
    locations: null,
    zones: null,
  },
};

export const fetchZones = createAsyncThunk(
  "lot/fetchZones",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/zone");
      if ("ArrayOfEnforcementZone" in data) {
        return data.ArrayOfEnforcementZone.EnforcementZone;
      }
      return [];
    } catch (error) {
      showToast("Error fetching zones");
      return rejectWithValue("Failed to fetch zones");
    }
  }
);

export const fetchLocations = createAsyncThunk(
  "lot/fetchLocations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/location");
      return data;
    } catch (error) {
      showToast("Error fetching locations");
      return rejectWithValue("Failed to fetch locations");
    }
  }
);

export const lotSlice = createSlice({
  name: "lot",
  initialState,
  reducers: {
    setSelectedLot: (state, action: PayloadAction<LotType | null>) => {
      state.selectedLot = action.payload;
    },
    setCreateModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isCreateModalVisible = action.payload;
    },
    setEditModalVisible: (state, action: PayloadAction<boolean>) => {
      state.isEditModalVisible = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Lots
    builder
      // Zones
      .addCase(fetchZones.pending, (state) => {
        state.loading.zones = true;
        state.error.zones = null;
      })
      .addCase(fetchZones.fulfilled, (state, action) => {
        state.zones = action.payload;
        state.loading.zones = false;
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.loading.zones = false;
        state.error.zones = action.payload as string;
      })
      // Locations
      .addCase(fetchLocations.pending, (state) => {
        state.loading.locations = true;
        state.error.locations = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locations = action.payload;
        state.loading.locations = false;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading.locations = false;
        state.error.locations = action.payload as string;
      });
  },
});

export const { setSelectedLot, setCreateModalVisible, setEditModalVisible } =
  lotSlice.actions;

export default lotSlice.reducer;
