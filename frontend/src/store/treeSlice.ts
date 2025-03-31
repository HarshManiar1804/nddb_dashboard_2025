import { createSlice } from "@reduxjs/toolkit";

const treeSlice = createSlice({
  name: "trees",
  initialState: [],
  reducers: {
    addTree: (state, action) => {
      state.push(action.payload);
    },
  },
});

export const { addTree } = treeSlice.actions;
export default treeSlice.reducer;
