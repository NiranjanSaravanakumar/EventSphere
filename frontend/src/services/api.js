import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach Bearer token ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eventsphere_token');
      localStorage.removeItem('eventsphere_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ── Auth endpoints ─────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Events endpoints ───────────────────────────────────────────────────────
export const eventsApi = {
  getAll:     ()           => api.get('/events'),
  getById:    (id)         => api.get(`/events/${id}`),
  getMyEvents:()           => api.get('/events/organizer'),
  create:     (data)       => api.post('/events', data),
  update:     (id, data)   => api.put(`/events/${id}`, data),
  delete:     (id)         => api.delete(`/events/${id}`),
};

// ── Registrations endpoints ────────────────────────────────────────────────
export const registrationsApi = {
  register:  (eventId) => api.post(`/registrations/event/${eventId}`),
  myTickets: ()        => api.get('/registrations/my-tickets'),
};

// ── Check-in endpoint ──────────────────────────────────────────────────────
export const checkInApi = {
  validate: (qrToken) => api.post('/check-in', { qrToken }),
};

// ── Analytics endpoint ─────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
};

export default api;
