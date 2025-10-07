import { invoke } from '@tauri-apps/api/core';
import { config, isTauriBackend } from '../config';
import {
  User,
  UserCreate,
  UserUpdate,
  LoginRequest,
  AuthResponse,
  Progress,
  ProgressCreate,
  ProgressUpdate,
  Notification,
  NotificationCreate,
  Subscription,
  Setting,
  Metrics,
  ComparisonData,
  LeaderboardEntry,
} from '../types';

// Helper for Express API calls
class ExpressApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    // Always get fresh token from localStorage
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed.state?.accessToken || null;
      }
    } catch (error) {
      console.error('Failed to get token:', error);
    }
    return null;
  }

  setToken(token: string) {
    // Token is managed by zustand store, this is just for backward compatibility
    console.log('Token set via API client');
  }

  clearToken() {
    // Token is managed by zustand store
    console.log('Token cleared via API client');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const expressClient = new ExpressApiClient(config.expressApiUrl || '');

// Auth API
export const authApi = {
  register: async (userData: UserCreate): Promise<User> => {
    if (isTauriBackend()) {
      return await invoke('register_user', { userData });
    } else {
      return await expressClient.post('/auth/register', userData);
    }
  },

  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    if (isTauriBackend()) {
      return await invoke('login_user', { loginData });
    } else {
      const response = await expressClient.post<AuthResponse>('/auth/login', loginData);
      expressClient.setToken(response.accessToken);
      return response;
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    if (isTauriBackend()) {
      return await invoke('logout_user', { refreshToken });
    } else {
      await expressClient.post('/auth/logout', { refreshToken });
      expressClient.clearToken();
    }
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    if (isTauriBackend()) {
      return await invoke('refresh_token', { refreshToken });
    } else {
      const response = await expressClient.post<AuthResponse>('/auth/refresh', { refreshToken });
      expressClient.setToken(response.accessToken);
      return response;
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    if (isTauriBackend()) {
      return await invoke('forgot_password', { email });
    } else {
      await expressClient.post('/auth/forgot-password', { email });
    }
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    if (isTauriBackend()) {
      return await invoke('reset_password', { token, password });
    } else {
      await expressClient.post('/auth/reset-password', { token, password });
    }
  },

  getCurrentUser: async (userId: number): Promise<User> => {
    if (isTauriBackend()) {
      return await invoke('get_current_user', { userId });
    } else {
      return await expressClient.get('/auth/me');
    }
  },
};

// User API
export const userApi = {
  getProfile: async (userId: number): Promise<User> => {
    if (isTauriBackend()) {
      return await invoke('get_user_profile', { userId });
    } else {
      return await expressClient.get(`/users/${userId}`);
    }
  },

  updateProfile: async (userId: number, updateData: UserUpdate): Promise<User> => {
    if (isTauriBackend()) {
      return await invoke('update_user_profile', { userId, updateData });
    } else {
      return await expressClient.put(`/users/${userId}`, updateData);
    }
  },

  deleteAccount: async (userId: number): Promise<void> => {
    if (isTauriBackend()) {
      return await invoke('delete_user_account', { userId });
    } else {
      await expressClient.delete(`/users/${userId}`);
    }
  },
};

// Progress API
export const progressApi = {
  add: async (progressData: ProgressCreate): Promise<Progress> => {
    if (isTauriBackend()) {
      return await invoke('add_progress', { progressData });
    } else {
      return await expressClient.post('/progress', progressData);
    }
  },

  getAll: async (userId: number, filters?: any): Promise<Progress[]> => {
    if (isTauriBackend()) {
      return await invoke('get_user_progress', { userId, ...filters });
    } else {
      const params = new URLSearchParams(filters).toString();
      return await expressClient.get(`/progress?${params}`);
    }
  },

  getById: async (progressId: number): Promise<Progress> => {
    if (isTauriBackend()) {
      return await invoke('get_user_progress_by_id', { progressId });
    } else {
      return await expressClient.get(`/progress/${progressId}`);
    }
  },

  update: async (progressId: number, updateData: ProgressUpdate): Promise<Progress> => {
    if (isTauriBackend()) {
      return await invoke('update_progress', { progressId, updateData });
    } else {
      return await expressClient.put(`/progress/${progressId}`, updateData);
    }
  },

  delete: async (progressId: number): Promise<void> => {
    if (isTauriBackend()) {
      return await invoke('delete_progress', { progressId });
    } else {
      await expressClient.delete(`/progress/${progressId}`);
    }
  },
};

// Compare API
export const compareApi = {
  compareProgress: async (userId: number, friendId: number, filters?: any): Promise<ComparisonData> => {
    if (isTauriBackend()) {
      return await invoke('compare_progress', { userId, friendId, ...filters });
    } else {
      const params = new URLSearchParams(filters).toString();
      return await expressClient.get(`/compare/user/${friendId}?${params}`);
    }
  },

  inviteFriend: async (userId: number, friendEmail: string): Promise<void> => {
    if (isTauriBackend()) {
      return await invoke('invite_friend', { userId, friendEmail });
    } else {
      await expressClient.post('/compare/invite', { friendEmail });
    }
  },

  getLeaderboard: async (filters?: any): Promise<LeaderboardEntry[]> => {
    if (isTauriBackend()) {
      return await invoke('get_leaderboard', filters || {});
    } else {
      const params = new URLSearchParams(filters).toString();
      return await expressClient.get(`/compare/leaderboard?${params}`);
    }
  },
};

// Notification API
export const notificationApi = {
  getAll: async (userId: number, filters?: any): Promise<Notification[]> => {
    if (isTauriBackend()) {
      return await invoke('get_notifications', { userId, ...filters });
    } else {
      const params = new URLSearchParams(filters).toString();
      return await expressClient.get(`/notifications?${params}`);
    }
  },

  create: async (userId: number, notificationData: NotificationCreate): Promise<Notification> => {
    if (isTauriBackend()) {
      return await invoke('create_notification', { userId, notificationData });
    } else {
      return await expressClient.post('/notifications', notificationData);
    }
  },

  markAsRead: async (notificationId: number): Promise<Notification> => {
    if (isTauriBackend()) {
      return await invoke('mark_notification_read', { notificationId });
    } else {
      return await expressClient.put(`/notifications/${notificationId}/read`, {});
    }
  },

  delete: async (notificationId: number): Promise<void> => {
    if (isTauriBackend()) {
      return await invoke('delete_notification', { notificationId });
    } else {
      await expressClient.delete(`/notifications/${notificationId}`);
    }
  },
};

// Subscription API
export const subscriptionApi = {
  createCheckout: async (userId: number, planType: string): Promise<any> => {
    if (isTauriBackend()) {
      return await invoke('create_checkout_session', { userId, planType });
    } else {
      return await expressClient.post('/subscriptions/create-checkout', { planType });
    }
  },

  getSubscription: async (userId: number): Promise<Subscription> => {
    if (isTauriBackend()) {
      return await invoke('get_subscription', { userId });
    } else {
      return await expressClient.get('/subscriptions');
    }
  },

  cancel: async (userId: number): Promise<void> => {
    if (isTauriBackend()) {
      return await invoke('cancel_subscription', { userId });
    } else {
      await expressClient.post('/subscriptions/cancel', {});
    }
  },
};

// Settings API
export const settingsApi = {
  getAll: async (): Promise<Setting[]> => {
    if (isTauriBackend()) {
      return await invoke('get_settings');
    } else {
      return await expressClient.get('/settings');
    }
  },

  update: async (key: string, value: string): Promise<Setting> => {
    if (isTauriBackend()) {
      return await invoke('update_settings', { key, value });
    } else {
      return await expressClient.put(`/settings/${key}`, { value });
    }
  },

  getMetrics: async (): Promise<Metrics> => {
    if (isTauriBackend()) {
      return await invoke('get_metrics');
    } else {
      return await expressClient.get('/settings/metrics');
    }
  },
};

// Groups API
export const groupsApi = {
  create: async (groupData: { name: string; description?: string }) => {
    if (isTauriBackend()) {
      throw new Error('Groups not supported in Tauri backend');
    }
    return await expressClient.post('/groups', groupData);
  },

  join: async (code: string) => {
    if (isTauriBackend()) {
      throw new Error('Groups not supported in Tauri backend');
    }
    return await expressClient.post('/groups/join', { code });
  },

  getMyGroup: async () => {
    if (isTauriBackend()) {
      throw new Error('Groups not supported in Tauri backend');
    }
    return await expressClient.get('/groups/my-group');
  },

  getGroup: async (groupId: number) => {
    if (isTauriBackend()) {
      throw new Error('Groups not supported in Tauri backend');
    }
    return await expressClient.get(`/groups/${groupId}`);
  },

  getGroupProgress: async (groupId: number, filters?: any) => {
    if (isTauriBackend()) {
      throw new Error('Groups not supported in Tauri backend');
    }
    const params = filters ? new URLSearchParams(filters).toString() : '';
    return await expressClient.get(`/groups/${groupId}/progress${params ? '?' + params : ''}`);
  },

  leave: async (groupId: number) => {
    if (isTauriBackend()) {
      throw new Error('Groups not supported in Tauri backend');
    }
    return await expressClient.delete(`/groups/${groupId}/leave`);
  },
};

