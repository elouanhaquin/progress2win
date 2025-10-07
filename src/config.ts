export type BackendType = 'tauri' | 'express';

export interface AppConfig {
  backendType: BackendType;
  expressApiUrl?: string;
}

// Read from environment or default to Tauri
const backendType = (import.meta.env.VITE_BACKEND_TYPE as BackendType) || 'tauri';
const expressApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const config: AppConfig = {
  backendType,
  expressApiUrl: backendType === 'express' ? expressApiUrl : undefined,
};

export const isTauriBackend = () => config.backendType === 'tauri';
export const isExpressBackend = () => config.backendType === 'express';

