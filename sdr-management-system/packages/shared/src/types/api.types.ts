// API Types for Phase 1
// Based on Phase 1 Architecture Document

import { SDR, SDRListResponse, APIError } from './sdr.types';

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: PaginationInfo;
  metadata?: ApiMetadata;
}

// Enhanced API Response Types
export interface SDRCreationResponse extends ApiResponse<SDR> {}
export interface SDRUpdateResponse extends ApiResponse<SDR> {}
export interface SDRDeletionResponse extends ApiResponse<boolean> {}

// API Request Types
export interface ApiRequest<T = any> {
  method: HttpMethod;
  url: string;
  data?: T;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

// API Metadata
export interface ApiMetadata {
  requestId: string;
  timestamp: string;
  version: string;
  executionTimeMs: number;
}

// Search and Filter Types
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
  sort?: SortOption[];
}

export interface FilterOption {
  field: string;
  operator: FilterOperator;
  value: any;
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

export enum FilterOperator {
  Equals = 'eq',
  NotEquals = 'ne',
  GreaterThan = 'gt',
  LessThan = 'lt',
  GreaterEqual = 'ge',
  LessEqual = 'le',
  In = 'in',
  NotIn = 'nin',
  Contains = 'contains',
  NotContains = 'not_contains',
  StartsWith = 'starts_with',
  EndsWith = 'ends_with'
}

// Batch Operation Types
export interface BatchRequest<T = any> {
  requests: ApiRequest<T>[];
  continueOnError?: boolean;
  timeout?: number;
}

export interface BatchResponse {
  responses: ApiResponse[];
  summary: BatchSummary;
}

export interface BatchSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  executionTimeMs: number;
  errors: ValidationError[];
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter?: number;
}

// API Configuration Types
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
  interceptors?: ApiInterceptors;
}

export interface ApiInterceptors {
  request?: (config: ApiRequest) => ApiRequest;
  response?: (response: ApiResponse) => ApiResponse;
  error?: (error: ApiError) => ApiError;
}

// WebSocket/Event Types (Future Phase)
export interface EventMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

// CORS and Security Types
export interface CorsConfig {
  enabled: boolean;
  origins: string[];
  methods: HttpMethod[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
}

// Health Check Types
export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  checks: Record<string, HealthCheckResult>;
  dependencies: Record<string, DependencyStatus>;
}

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  responseTime: number;
  message?: string;
  timestamp: string;
}

export interface DependencyStatus {
  name: string;
  status: HealthStatus;
  message?: string;
  timestamp: string;
}

export enum HealthStatus {
  Pass = 'pass',
  Warn = 'warn',
  Fail = 'fail'
}

// Error Response Types
export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  metadata: ApiMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  validationErrors?: ValidationError[];
}

// Common HTTP Status Codes as Types
export enum HttpStatusCode {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  UnprocessableEntity = 422,
  TooManyRequests = 429,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504
}

// SDK Types (For Future Implementation)
export interface ApiClient {
  request<T>(config: ApiRequest): Promise<ApiResponse<T>>;
  get<T>(url: string, config?: Partial<ApiRequest>): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any, config?: Partial<ApiRequest>): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any, config?: Partial<ApiRequest>): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: Partial<ApiRequest>): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: any, config?: Partial<ApiRequest>): Promise<ApiResponse<T>>;
}