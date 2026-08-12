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

// ── Response interceptor — handle 401/403 globally ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('eventsphere_token');
      localStorage.removeItem('eventsphere_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Events — public listing (attendee-facing, no eventCode rendered by UI) ─
export const eventsApi = {
  available:  ()         => api.get('/events/available'),
  getById:    (id)       => api.get(`/events/${id}`),
  create:     (data)     => api.post('/events', data),
  update:     (id, data) => api.put(`/events/${id}`, data),
  delete:     (id)       => api.delete(`/events/${id}`),
};

// ── Organizer — scoped to the JWT token holder (me) ───────────────────────
export const organizerApi = {
  myEvents:    () => api.get('/organizers/me/events'),
  myDashboard: () => api.get('/organizers/me/dashboard'),
};

// ── Attendee — scoped to the JWT token holder (me) ────────────────────────
export const attendeeApi = {
  myTickets: () => api.get('/attendees/me/tickets'),
};

// ── Registrations ──────────────────────────────────────────────────────────
export const registrationsApi = {
  register:  (eventId, eventCode) => api.post(`/registrations/event/${eventId}`, { eventCode }),
  cancel:    (registrationId)     => api.delete(`/registrations/${registrationId}`),
  guestList: (eventId)            => api.get(`/registrations/event/${eventId}/guests`),
};

// ── Admin ──────────────────────────────────────────────────────────────────
export const adminApi = {
  getUsers:   () => api.get('/admin/users'),
  getEvents:  () => api.get('/admin/events'),
  analytics:  () => api.get('/admin/analytics'),
};

// ── Check-in ───────────────────────────────────────────────────────────────
export const checkInApi = {
  validate: (qrToken) => api.post('/events/check-in', { qrToken }),
};

export default api;
