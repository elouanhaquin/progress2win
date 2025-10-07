// Types for the application
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  goals: string[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  goals?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Progress {
  id: number;
  userId: number;
  category: string;
  metric: string;
  value: number;
  unit?: string;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressCreate {
  category: string;
  metric: string;
  value: number;
  unit?: string;
  notes?: string;
  date: string;
}

export interface ProgressUpdate {
  category?: string;
  metric?: string;
  value?: number;
  unit?: string;
  notes?: string;
  date?: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationCreate {
  userId: number;
  title: string;
  message: string;
  notificationType?: string;
}

export interface Subscription {
  id: number;
  userId: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: string;
  planType: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Metrics {
  totalUsers: number;
  totalProgressEntries: number;
  averageProgressPerUser: number;
  mostPopularCategory?: string;
  mostPopularMetric?: string;
}

export interface ComparisonData {
  user: Progress[];
  [key: string]: Progress[];
}

export interface LeaderboardEntry {
  userId: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  avgValue: number;
  entryCount: number;
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ProgressFormData {
  category: string;
  metric: string;
  value: number;
  unit?: string;
  notes?: string;
  date: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  goals: string[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

// Theme types
export type Theme = 'light' | 'dark';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Progress categories
export const PROGRESS_CATEGORIES = [
  'fitness',
  'health',
  'learning',
  'productivity',
  'finance',
  'hobbies',
  'other'
] as const;

export type ProgressCategory = typeof PROGRESS_CATEGORIES[number];

// Common metrics
export const COMMON_METRICS = {
  fitness: ['weight', 'reps', 'sets', 'distance', 'time', 'calories'],
  health: ['weight', 'blood_pressure', 'heart_rate', 'steps', 'sleep_hours'],
  learning: ['hours_studied', 'pages_read', 'lessons_completed', 'words_learned'],
  productivity: ['tasks_completed', 'hours_worked', 'projects_finished'],
  finance: ['income', 'expenses', 'savings', 'investments'],
  hobbies: ['hours_practiced', 'pieces_completed', 'sessions'],
  other: ['custom']
} as const;

export type MetricType = typeof COMMON_METRICS[keyof typeof COMMON_METRICS][number];
