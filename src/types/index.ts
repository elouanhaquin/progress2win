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

// Group types
export interface Group {
  id: number;
  name: string;
  code: string;
  creator_id: number;
  description?: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  creator_first_name?: string;
  creator_last_name?: string;
}

export interface GroupMember {
  id: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  joined_at: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export interface GroupCreate {
  name: string;
  description?: string;
}

export interface GroupProgressEntry extends Progress {
  first_name: string;
  last_name: string;
  avatar_url?: string;
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
  'strength',
  'cardio',
  'bodyweight',
  'weight_loss',
  'nutrition',
  'other'
] as const;

export type ProgressCategory = typeof PROGRESS_CATEGORIES[number];

// Common metrics
export const COMMON_METRICS = {
  strength: ['bench_press', 'squat', 'deadlift', 'overhead_press', 'weight_lifted', 'reps', 'sets'],
  cardio: ['distance', 'time', 'speed', 'calories', 'heart_rate'],
  bodyweight: ['pull_ups', 'push_ups', 'dips', 'sit_ups', 'planks', 'reps', 'time'],
  weight_loss: ['weight', 'body_fat_percentage', 'waist', 'chest', 'arms', 'legs'],
  nutrition: ['calories', 'protein', 'carbs', 'fats', 'water'],
  other: ['custom']
} as const;

export type MetricType = typeof COMMON_METRICS[keyof typeof COMMON_METRICS][number];
