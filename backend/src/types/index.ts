export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  goals?: string[];
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
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
  user: User;
  accessToken: string;
  refreshToken: string;
  passwordResetRequired?: boolean;
}

export interface Progress {
  id: number;
  user_id: number;
  category: string;
  metric: string;
  value: number;
  unit?: string;
  notes?: string;
  date: Date;
  created_at: Date;
  updated_at: Date;
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
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: Date;
}

export interface NotificationCreate {
  title: string;
  message: string;
  type?: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: string;
  plan_type: string;
  current_period_start?: Date;
  current_period_end?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ComparisonData {
  user: User;
  progress: Progress[];
  totalEntries: number;
  averageValue: number;
}

export interface LeaderboardEntry {
  user: User;
  totalProgress: number;
  rank: number;
}

export interface Metrics {
  totalUsers: number;
  totalProgress: number;
  activeUsers: number;
}

