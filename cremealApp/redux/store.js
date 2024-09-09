// store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import FavoriteMealReducer from './slices/FavoriteMealSlice';
export const store = configureStore({
  reducer: {
    user: userReducer,
    FavoriteMeal: FavoriteMealReducer
  },
});
