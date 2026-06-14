import axios, { AxiosError } from 'axios';
import { useAuthStore } from './store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as any;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        refreshSubscribers.forEach((cb) => cb(data.accessToken));
        refreshSubscribers = [];
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  login: (data: any) => api.post('/auth/login', data).then((r) => r.data),
  register: (data: any) => api.post('/auth/register', data).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data).then((r) => r.data),
  setup2FA: () => api.post('/auth/2fa/setup').then((r) => r.data),
  enable2FA: (totpCode: string) => api.post('/auth/2fa/enable', { totpCode }).then((r) => r.data),
  changePassword: (data: any) => api.post('/auth/change-password', data).then((r) => r.data),
};

// Messages
export const messagesApi = {
  list: (params?: any) => api.get('/messages', { params }).then((r) => r.data),
  send: (data: any) => api.post('/messages', data).then((r) => r.data),
  stats: () => api.get('/messages/stats').then((r) => r.data),
  conversation: (contactId: string, params?: any) => api.get(`/messages/conversation/${contactId}`, { params }).then((r) => r.data),
  markRead: (id: string) => api.patch(`/messages/${id}/read`).then((r) => r.data),
};

// Calls
export const callsApi = {
  list: (params?: any) => api.get('/calls', { params }).then((r) => r.data),
  make: (data: any) => api.post('/calls', data).then((r) => r.data),
  stats: () => api.get('/calls/stats').then((r) => r.data),
  hangup: (id: string) => api.post(`/calls/${id}/hangup`).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/calls/${id}`, data).then((r) => r.data),
};

// Contacts
export const contactsApi = {
  list: (params?: any) => api.get('/contacts', { params }).then((r) => r.data),
  create: (data: any) => api.post('/contacts', data).then((r) => r.data),
  get: (id: string) => api.get(`/contacts/${id}`).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/contacts/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/contacts/${id}`).then((r) => r.data),
  tags: () => api.get('/contacts/tags').then((r) => r.data),
  importCsv: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/contacts/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  exportCsv: () => api.get('/contacts/export', { responseType: 'blob' }).then((r) => r.data),
};

// Campaigns
export const campaignsApi = {
  list: (params?: any) => api.get('/campaigns', { params }).then((r) => r.data),
  create: (data: any) => api.post('/campaigns', data).then((r) => r.data),
  get: (id: string) => api.get(`/campaigns/${id}`).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/campaigns/${id}`, data).then((r) => r.data),
  launch: (id: string) => api.post(`/campaigns/${id}/launch`).then((r) => r.data),
  pause: (id: string) => api.post(`/campaigns/${id}/pause`).then((r) => r.data),
  cancel: (id: string) => api.post(`/campaigns/${id}/cancel`).then((r) => r.data),
  stats: (id: string) => api.get(`/campaigns/${id}/stats`).then((r) => r.data),
};

// Analytics
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard').then((r) => r.data),
  messageActivity: (days?: number) => api.get('/analytics/messages/activity', { params: { days } }).then((r) => r.data),
  callActivity: (days?: number) => api.get('/analytics/calls/activity', { params: { days } }).then((r) => r.data),
};

// Twilio
export const twilioApi = {
  status: () => api.get('/twilio/status').then((r) => r.data),
  saveCredentials: (data: any) => api.post('/twilio/credentials', data).then((r) => r.data),
  test: () => api.post('/twilio/test').then((r) => r.data),
  phoneNumbers: () => api.get('/twilio/phone-numbers').then((r) => r.data),
  syncPhoneNumbers: () => api.post('/twilio/phone-numbers/sync').then((r) => r.data),
  voiceToken: () => api.get('/twilio/voice-token').then((r) => r.data),
  usage: () => api.get('/twilio/usage').then((r) => r.data),
};

// Setup
export const setupApi = {
  status: () => api.get('/setup/status').then((r) => r.data),
  run: (data: any) => api.post('/setup', data).then((r) => r.data),
};

// Users
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }).then((r) => r.data),
  invite: (data: any) => api.post('/users/invite', data).then((r) => r.data),
  get: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data).then((r) => r.data),
  deactivate: (id: string) => api.post(`/users/${id}/deactivate`).then((r) => r.data),
};

// Notifications
export const notificationsApi = {
  list: (params?: any) => api.get('/notifications', { params }).then((r) => r.data),
  markAllRead: () => api.post('/notifications/read-all').then((r) => r.data),
  markRead: (id: string) => api.post(`/notifications/${id}/read`).then((r) => r.data),
};

// Templates
export const templatesApi = {
  list: (params?: any) => api.get('/templates', { params }).then((r) => r.data),
  create: (data: any) => api.post('/templates', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/templates/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/templates/${id}`).then((r) => r.data),
};

// Organization
export const orgApi = {
  me: () => api.get('/organizations/me').then((r) => r.data),
  update: (data: any) => api.put('/organizations/me', data).then((r) => r.data),
  updateBranding: (data: any) => api.put('/organizations/me/branding', data).then((r) => r.data),
};

// Admin
export const adminApi = {
  overview: () => api.get('/admin/overview').then((r) => r.data),
  organizations: (params?: any) => api.get('/admin/organizations', { params }).then((r) => r.data),
  users: (params?: any) => api.get('/admin/users', { params }).then((r) => r.data),
  dealers: () => api.get('/admin/dealers').then((r) => r.data),
  auditLogs: (params?: any) => api.get('/admin/audit-logs', { params }).then((r) => r.data),
  backups: () => api.get('/admin/backups').then((r) => r.data),
  createBackup: () => api.post('/admin/backups').then((r) => r.data),
};

// Dealer portal
export const dealerApi = {
  organizations: () => api.get('/dealers/organizations').then((r) => r.data),
  stats: () => api.get('/dealers/stats').then((r) => r.data),
  createOrganization: (data: any) => api.post('/dealers/organizations', data).then((r) => r.data),
  toggleOrganization: (id: string, isActive: boolean) =>
    api.patch(`/dealers/organizations/${id}/toggle`, { isActive }).then((r) => r.data),
};

// AI
export const aiApi = {
  suggestReply: (message: string, contactName?: string) => api.post('/ai/suggest-reply', { message, contactName }).then((r) => r.data),
  generateCampaign: (data: any) => api.post('/ai/generate-campaign', data).then((r) => r.data),
};

// Webhooks
export const webhooksApi = {
  list: () => api.get('/webhooks').then((r) => r.data),
  create: (data: any) => api.post('/webhooks', data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/webhooks/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/webhooks/${id}`).then((r) => r.data),
  test: (id: string) => api.post(`/webhooks/${id}/test`).then((r) => r.data),
};

// API Keys
export const apiKeysApi = {
  list: () => api.get('/api-keys').then((r) => r.data),
  create: (data: any) => api.post('/api-keys', data).then((r) => r.data),
  revoke: (id: string) => api.delete(`/api-keys/${id}`).then((r) => r.data),
};
