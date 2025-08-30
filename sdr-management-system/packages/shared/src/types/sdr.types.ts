// SDR Types for Phase 1 Implementation
// Based on Phase 1 Architecture Document

export interface SDR {
  id: number;
  workItemId: number;
  title: string;
  description?: string;
  status: SDRStatus;
  priority: SDRPriority;
  requiredByDate?: string;
  customerType: CustomerType;
  sourceType: SourceType;
  submitterId: string;
  submitterEmail: string;
  submitterName?: string;
  createdAt: string;
  updatedAt: string;
}

export enum SDRStatus {
  New = 'New',
  Active = 'Active',
  Resolved = 'Resolved',
  Closed = 'Closed'
}

export enum SDRPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum CustomerType {
  Internal = 'Internal',
  External = 'External'
}

export enum SourceType {
  Manual = 'Manual'
}

// API Request/Response Types
export interface CreateSDRRequest {
  title: string;
  description?: string;
  priority: SDRPriority;
  customerType: CustomerType;
  requiredByDate?: string;
  sourceType: SourceType;
}

export interface SDRResponse {
  success: boolean;
  sdr?: SDR;
  error?: APIError;
}

export interface SDRListResponse {
  success: boolean;
  sdrs: SDR[];
  totalCount: number;
  pagination?: {
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  error?: APIError;
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// User Context Type (from authentication)
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  roles: string[];
  groups: string[];
}