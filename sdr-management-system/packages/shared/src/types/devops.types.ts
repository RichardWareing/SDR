// Azure DevOps Integration Types for Phase 1
// Based on Phase 1 Architecture Document

import { SDRStatus, SDRPriority, CustomerType, SourceType } from './sdr.types';

// Azure DevOps Work Item Schema for SDR
export interface DevOpsSDRSchema {
  // System Fields
  'System.Id': number;
  'System.Title': string;
  'System.Description': string;
  'System.WorkItemType': 'SDR Request';
  'System.State': SDRStatus;
  'System.AssignedTo'?: string;
  'System.CreatedBy': string;
  'System.CreatedDate': string;
  'System.ChangedBy': string;
  'System.ChangedDate': string;
  'System.AreaPath': string;
  'System.IterationPath': string;
  'System.Tags': string;

  // Custom SDR Fields
  'Custom.SubmitterId': string;
  'Custom.SubmitterEmail': string;
  'Custom.SubmitterName': string;
  'Custom.CustomerType': CustomerType;
  'Custom.RequiredByDate': string;
  'Custom.Priority': SDRPriority;
  'Custom.SourceType': SourceType;
  'Custom.EstimatedHours'?: number;
  'Custom.ActualHours'?: number;
}

// Work Item Reference for Query Results
export interface DevOpsWorkItemReference {
  id: number;
  url: string;
  fields: Partial<DevOpsSDRSchema>;
}

// Full Work Item Response
export interface DevOpsWorkItem extends DevOpsWorkItemReference {
  _links?: {
    [key: string]: {
      href: string;
    };
  };
  relations?: DevOpsWorkItemRelation[];
  rev?: number;
}

export interface DevOpsWorkItemRelation {
  rel: string;
  url: string;
  attributes?: {
    [key: string]: any;
  };
}

// PAT Token and Authentication Types
export interface DevOpsConfig {
  organization: string;
  patToken: string;
  baseUrl?: string;
}

// WIQL Query Results
export interface DevOpsQueryResult<T = any> {
  queryType: string;
  queryResultType: string;
  asOf: string;
  columns: DevOpsQueryColumn[];
  workItems: T[];
  workItemRelations: DevOpsWorkItemRelation[];
}

export interface DevOpsQueryColumn {
  referenceName: string;
  name: string;
  url: string;
}

// Patch Operations for Work Item Updates
export interface PatchOperation {
  op: 'add' | 'replace' | 'remove' | 'test';
  path: string;
  value?: any;
  from?: string;
}

// Work Item Creation Request
export interface CreateWorkItemRequest {
  type: string;
  fields: Record<string, any>;
  relations?: DevOpsWorkItemRelation[];
}

// DevOps API Error Types
export interface DevOpsError {
  $id: string;
  innerException?: DevOpsError;
  message: string;
  typeName: string;
  typeKey: string;
  errorCode: number;
  eventId: number;
}

// Batch Operations
export interface BatchWorkItemRequest {
  method: 'PATCH' | 'POST' | 'GET';
  uri: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface BatchResponse {
  count: number;
  value: any[];
}

// Project and Organization Types
export interface DevOpsProject {
  id: string;
  name: string;
  description?: string;
  url: string;
  state: string;
  revision: number;
  visibility: string;
  lastUpdateTime: string;
}

export interface DevOpsOrganization {
  accountId: string;
  accountUri: string;
  accountName: string;
  properties: Record<string, any>;
}

// Re-export SDR types for convenience
export type { SDR, SDRStatus, SDRPriority, CustomerType, SourceType } from './sdr.types';