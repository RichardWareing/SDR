export * from './sdr.types';
export * from './api.types';
export * from './auth.types';
export * from './devops.types';

// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface FilterParams {
  [key: string]: any;
}

export interface SearchParams {
  query?: string;
  filters?: FilterParams;
  pagination?: PaginationParams;
}

// Configuration types
export interface DatabaseConfig {
  connectionString: string;
  maxPoolSize?: number;
  commandTimeout?: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  redisConnectionString?: string;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
}

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  port: number;
  cors: {
    enabled: boolean;
    origins: string[];
  };
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
  };
  database: DatabaseConfig;
  cache: CacheConfig;
  logging: LoggingConfig;
}