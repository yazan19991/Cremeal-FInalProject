// slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    firstTimeloginGoogle: false,
  },
  reducers: {
    setUserInformation(state, action) {
      state.userInformation = action.payload;
    },
    setUserImage(state, action) {
      state.userImage = action.payload;
    },
    clearUser(state) {
      state.userInformation = null;
      state.userImage = null;
    },
    setUser_login_google(state, action) {
      state.firstTimeloginGoogle = action.payload;
    },
  },
});


export const { setUserInformation, setUserImage, clearUser,setUser_login_google } = userSlice.actions;
export default userSlice.reducer;
