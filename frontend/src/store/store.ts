import { configureStore } from "@reduxjs/toolkit";
import treeReducer from "./treeSlice";
import mapReducer from "./mapSlice";

export const store = configureStore({
  reducer: {
    trees: treeReducer,
    map: mapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
