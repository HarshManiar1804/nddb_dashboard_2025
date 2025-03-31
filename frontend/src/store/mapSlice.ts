import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MapState {
  mapType: string;
}

const initialState: MapState = {
  mapType: "satellite", // Store type instead of URL
};

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMapType: (state, action: PayloadAction<string>) => {
      state.mapType = action.payload;
    },
  },
});

export const { setMapType } = mapSlice.actions;
export default mapSlice.reducer;
