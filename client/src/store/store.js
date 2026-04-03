import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import userReducer from "./userSlice.js";
import reviewReducer from "./reviewSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    review: reviewReducer,
  },
});
