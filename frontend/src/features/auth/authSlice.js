import { createSlice } from '@reduxjs/toolkit';

// Access token lives in memory only (refresh token is an httpOnly cookie).
// The user object is cached in localStorage for fast first paint.
const cachedUser = (() => {
  try { return JSON.parse(localStorage.getItem('artmind_user')) || null; }
  catch { return null; }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: cachedUser, accessToken: null, status: 'idle' },
  reducers: {
    setCredentials(state, { payload }) {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      localStorage.setItem('artmind_user', JSON.stringify(payload.user));
    },
    setAccessToken(state, { payload }) {
      state.accessToken = payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('artmind_user');
    },
  },
});

export const { setCredentials, setAccessToken, logout } = authSlice.actions;
export const selectUser = (s) => s.auth.user;
export const selectIsAuthed = (s) => Boolean(s.auth.user);
export const selectIsAdmin = (s) => s.auth.user?.role === 'ADMIN';
export default authSlice.reducer;
