import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import appReducer from "./slice/appReducer";
import statsReducer from "./slice/statsReducer";
import authReducer from "./slice/authReducer";
import lotReducer from "./slice/lotReducer";
import psReducer from "./slice/psReducer";
import vsReducer from "./slice/vsReducer";
import pmReducer from "./slice/pmReducer";

export const store = configureStore({
  reducer: {
    app: appReducer,
    stats: statsReducer,
    auth: authReducer,
    ps: psReducer,
    vs: vsReducer,
    lot: lotReducer,
    pm: pmReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
