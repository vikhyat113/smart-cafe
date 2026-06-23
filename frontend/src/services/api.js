import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach the admin JWT (if present) to every request. Public customer
// endpoints simply ignore the header server-side, so it's safe to always
// send it when available.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a request fails with 401 while an admin token is set, the token is
// stale/expired — clear it so the UI can redirect to login instead of
// looping on broken requests.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401 && localStorage.getItem('admin_token')) {
      localStorage.removeItem('admin_token');
    }
    return Promise.reject(err);
  }
);

export default api;
export { API_URL };
