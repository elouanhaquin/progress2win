import { invoke } from '@tauri-apps/api/tauri';
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

// Auth API
export const authApi = {
  register: async (userData: UserCreate): Promise<User> => {
    return await invoke('register_user', { userData });
  },

  login: async (loginData: LoginRequest): Promise<AuthResponse> => {
    return await invoke('login_user', { loginData });
  },

  logout: async (refreshToken: string): Promise<void> => {
    return await invoke('logout_user', { refreshToken });
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return await invoke('refresh_token', { refreshToken });
  },

  forgotPassword: async (email: string): Promise<void> => {
    return await invoke('forgot_password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    return await invoke('reset_password', { token, password });
  },

  getCurrentUser: async (userId: number): Promise<User> => {
    return await invoke('get_current_user', { userId });
  },
};

// Users API
export const usersApi = {
  getProfile: async (userId: number): Promise<User> => {
    return await invoke('get_user_profile', { userId });
  },

  updateProfile: async (userId: number, updateData: UserUpdate): Promise<User> => {
    return await invoke('update_user_profile', { userId, updateData });
  },

  deleteAccount: async (userId: number): Promise<void> => {
    return await invoke('delete_user_account', { userId });
  },
};

// Progress API
export const progressApi = {
  add: async (userId: number, progressData: ProgressCreate): Promise<Progress> => {
    return await invoke('add_progress', { userId, progressData });
  },

  getUserProgress: async (
    userId: number,
    limit?: number,
    offset?: number
  ): Promise<Progress[]> => {
    return await invoke('get_user_progress', { userId, limit, offset });
  },

  getUserProgressById: async (
    targetUserId: number,
    limit?: number,
    offset?: number
  ): Promise<Progress[]> => {
    return await invoke('get_user_progress_by_id', { targetUserId, limit, offset });
  },

  update: async (
    progressId: number,
    userId: number,
    updateData: ProgressUpdate
  ): Promise<Progress> => {
    return await invoke('update_progress', { progressId, userId, updateData });
  },

  delete: async (progressId: number, userId: number): Promise<void> => {
    return await invoke('delete_progress', { progressId, userId });
  },
};

// Compare API
export const compareApi = {
  compare: async (
    userId: number,
    friendIds: number[],
    category?: string,
    metric?: string
  ): Promise<ComparisonData> => {
    return await invoke('compare_progress', { userId, friendIds, category, metric });
  },

  inviteFriend: async (userId: number, friendEmail: string): Promise<void> => {
    return await invoke('invite_friend', { userId, friendEmail });
  },

  getLeaderboard: async (
    category?: string,
    metric?: string,
    limit?: number
  ): Promise<LeaderboardEntry[]> => {
    return await invoke('get_leaderboard', { category, metric, limit });
  },
};

// Notifications API
export const notificationsApi = {
  get: async (userId: number, limit?: number, offset?: number): Promise<Notification[]> => {
    return await invoke('get_notifications', { userId, limit, offset });
  },

  create: async (notificationData: NotificationCreate): Promise<Notification> => {
    return await invoke('create_notification', { notificationData });
  },

  markAsRead: async (notificationId: number, userId: number): Promise<void> => {
    return await invoke('mark_notification_read', { notificationId, userId });
  },

  delete: async (notificationId: number, userId: number): Promise<void> => {
    return await invoke('delete_notification', { notificationId, userId });
  },
};

// Subscriptions API
export const subscriptionsApi = {
  createCheckoutSession: async (userId: number, planType: string): Promise<string> => {
    return await invoke('create_checkout_session', { userId, planType });
  },

  get: async (userId: number): Promise<Subscription | null> => {
    return await invoke('get_subscription', { userId });
  },

  cancel: async (userId: number): Promise<void> => {
    return await invoke('cancel_subscription', { userId });
  },

  handleWebhook: async (webhookData: any): Promise<void> => {
    return await invoke('handle_stripe_webhook', { webhookData });
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<Setting[]> => {
    return await invoke('get_settings');
  },

  update: async (settings: Array<[string, string]>): Promise<void> => {
    return await invoke('update_settings', { settings });
  },

  getMetrics: async (): Promise<Metrics> => {
    return await invoke('get_metrics');
  },
};
