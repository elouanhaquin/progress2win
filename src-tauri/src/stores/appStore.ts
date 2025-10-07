import { create } from 'zustand';
import { Progress, Notification, Metrics } from '../types';

interface AppState {
  // Progress
  progress: Progress[];
  isLoadingProgress: boolean;
  progressError: string | null;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  isLoadingNotifications: boolean;
  notificationsError: string | null;

  // Metrics
  metrics: Metrics | null;
  isLoadingMetrics: boolean;
  metricsError: string | null;

  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}

interface AppActions {
  // Progress actions
  setProgress: (progress: Progress[]) => void;
  addProgress: (progress: Progress) => void;
  updateProgress: (id: number, progress: Progress) => void;
  removeProgress: (id: number) => void;
  setProgressLoading: (loading: boolean) => void;
  setProgressError: (error: string | null) => void;

  // Notification actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  removeNotification: (id: number) => void;
  setNotificationsLoading: (loading: boolean) => void;
  setNotificationsError: (error: string | null) => void;

  // Metrics actions
  setMetrics: (metrics: Metrics) => void;
  setMetricsLoading: (loading: boolean) => void;
  setMetricsError: (error: string | null) => void;

  // UI actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // State
  progress: [],
  isLoadingProgress: false,
  progressError: null,

  notifications: [],
  unreadCount: 0,
  isLoadingNotifications: false,
  notificationsError: null,

  metrics: null,
  isLoadingMetrics: false,
  metricsError: null,

  sidebarOpen: true,
  theme: 'light',

  // Progress actions
  setProgress: (progress: Progress[]) => {
    set({ progress });
  },

  addProgress: (progress: Progress) => {
    set((state) => ({
      progress: [progress, ...state.progress],
    }));
  },

  updateProgress: (id: number, updatedProgress: Progress) => {
    set((state) => ({
      progress: state.progress.map((p) =>
        p.id === id ? updatedProgress : p
      ),
    }));
  },

  removeProgress: (id: number) => {
    set((state) => ({
      progress: state.progress.filter((p) => p.id !== id),
    }));
  },

  setProgressLoading: (loading: boolean) => {
    set({ isLoadingProgress: loading });
  },

  setProgressError: (error: string | null) => {
    set({ progressError: error });
  },

  // Notification actions
  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  markAsRead: (id: number) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  removeNotification: (id: number) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.isRead
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    });
  },

  setNotificationsLoading: (loading: boolean) => {
    set({ isLoadingNotifications: loading });
  },

  setNotificationsError: (error: string | null) => {
    set({ notificationsError: error });
  },

  // Metrics actions
  setMetrics: (metrics: Metrics) => {
    set({ metrics });
  },

  setMetricsLoading: (loading: boolean) => {
    set({ isLoadingMetrics: loading });
  },

  setMetricsError: (error: string | null) => {
    set({ metricsError: error });
  },

  // UI actions
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
  },
}));
