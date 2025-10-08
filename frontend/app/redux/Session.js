import { createSlice } from '@reduxjs/toolkit';

export const Session = createSlice({
  name: 'session',
  initialState: {
    email: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
    },
    clearUser: (state) => {
      state.email = null;
      state.aesSalt = null;
    }
  }
});

export const {setUser, clearUser } = Session.actions;

export default Session.reducer;
