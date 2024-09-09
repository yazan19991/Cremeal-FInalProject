// slices/FavoriteMealSlice.js
import { createSlice } from '@reduxjs/toolkit';

const FavoriteMealSlice = createSlice({
  name: 'FavoriteMeal',
  initialState: {
    FavoriteMeals: [],
  },
  reducers: {
    setFavoriteMeals(state, action) {
      state.FavoriteMeals = action.payload;
    },
    addFavoriteMeal(state, action) {
      state.FavoriteMeals.push(action.payload);
    },
    removeFavoriteMeal(state, action) {
      console.log('Removing meal with ID:', action.payload.id);
      state.FavoriteMeals = state.FavoriteMeals.filter(meal => meal.id !== action.payload.id);
    }
    
  },
});

export const { setFavoriteMeals, addFavoriteMeal, removeFavoriteMeal } = FavoriteMealSlice.actions;
export default FavoriteMealSlice.reducer;
