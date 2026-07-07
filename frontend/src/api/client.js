import axios from 'axios';
import { store } from '../app/store.js';
import { setAccessToken, logout } from '../features/auth/authSlice.js';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send the refresh cookie
});

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, attempt a single silent refresh then replay the request.
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && original && !original._retried && !original.url?.includes('/auth/')) {
      original._retried = true;
      try {
        refreshing = refreshing || api.post('/auth/refresh');
        const { data } = await refreshing;
        refreshing = null;
        const accessToken = data?.data?.accessToken;
        store.dispatch(setAccessToken(accessToken));
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        store.dispatch(logout());
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);

// Normalises the API envelope into the payload (throws the message on failure).
export const unwrap = (promise) =>
  promise.then((r) => r.data.data).catch((e) => {
    const msg = e.response?.data?.error?.message || e.message;
    throw new Error(msg);
  });
