import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: Supabase environment variables not set');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize API client with axios
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
console.log('API Client initialized with baseURL:', apiUrl);

const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

// Add token to request headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    
    if (error.response) {
      console.error(`[API Error] ${error.response.status} ${method} ${url}:`, error.response.data);
    } else if (error.request) {
      console.error(`[API Network Error] No response from ${method} ${url}:`, error.message);
    } else {
      console.error(`[API Error] ${method} ${url}:`, error.message);
    }
    
    // Don't redirect on 401 for auth endpoints (login/signup can return 401 for invalid credentials)
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('authToken');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Auth APIs
export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  signup: (email, username, password, name, company) =>
    apiClient.post('/auth/signup', { email, username, password, name, company }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    apiClient.post('/auth/reset-password', { token, password }),
  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh-token', { refreshToken }),
};

// Teams APIs
export const teamsAPI = {
  list: () => apiClient.get('/teams'),
  create: (name) => apiClient.post('/teams', { name }),
  get: (teamId) => apiClient.get(`/teams/${teamId}`),
  getMembers: (teamId) => apiClient.get(`/teams/${teamId}/members`),
  inviteMember: (teamId, email, role = 'member') =>
    apiClient.post(`/teams/${teamId}/members/invite`, { email, role }),
  removeMember: (teamId, memberId) =>
    apiClient.delete(`/teams/${teamId}/members/${memberId}`),
  cancelInvitation: (teamId, invitationId) =>
    apiClient.delete(`/teams/${teamId}/members/invitations/${invitationId}`),
  updateMember: (teamId, memberId, role) =>
    apiClient.patch(`/teams/${teamId}/members/${memberId}`, { role }),
};

// Providers APIs
export const providersAPI = {
  list: (teamId) => apiClient.get(`/providers/${teamId}`),
  connect: (teamId, providerName, apiKey) =>
    apiClient.post(`/providers/${teamId}/connect`, { providerName, apiKey }),
  disconnect: (teamId, providerId) =>
    apiClient.delete(`/providers/${teamId}/disconnect/${providerId}`),
  sync: (teamId, providerId) =>
    apiClient.post(`/providers/${teamId}/sync/${providerId}`),
};

// Spending APIs
export const spendingAPI = {
  get: (teamId, params = {}) =>
    apiClient.get(`/spending/${teamId}`, { params }),
  getSummary: (teamId, params = {}) =>
    apiClient.get(`/spending/${teamId}/summary`, { params }),
  import: (teamId, entries) =>
    apiClient.post(`/spending/${teamId}/import`, { entries }),
};

// User APIs
export const userAPI = {
  getProfile: () => apiClient.get('/user'),
  updateProfile: (data) => apiClient.patch('/user', data),
  getAlerts: () => apiClient.get('/user/alerts'),
  updateAlerts: (data) => apiClient.patch('/user/alerts', data),
  changePassword: (currentPassword, newPassword) =>
    apiClient.post('/user/change-password', { currentPassword, newPassword }),
  getApiKeys: () => apiClient.get('/user/api-keys'),
  createApiKey: (name) => apiClient.post('/user/api-keys', { name }),
  updateApiKey: (keyId, name) => apiClient.patch(`/user/api-keys/${keyId}`, { name }),
  deleteApiKey: (keyId) => apiClient.delete(`/user/api-keys/${keyId}`),
};
// Billing APIs
export const billingAPI = {
  getCurrent: () => apiClient.get('/billing/current'),
  changePlan: (planId) => apiClient.post('/billing/change-plan', { planId }),
};

// Provider Ratings APIs (public endpoint - no auth required)
export const providerRatingsAPI = {
  list: () => apiClient.get('/provider-ratings'),
  get: (providerId) => apiClient.get(`/provider-ratings/${providerId}`),
};