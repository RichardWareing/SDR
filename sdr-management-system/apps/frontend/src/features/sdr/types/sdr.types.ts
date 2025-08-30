export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type CustomerType = 'Internal' | 'External';
export type SDRStatus = 'New' | 'Active' | 'Resolved' | 'Closed' | 'Removed';
export type SourceType = 'Manual' | 'Email' | 'File' | 'Teams';

export interface SDR {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  customerType: CustomerType;
  status: SDRStatus;
  sourceType: SourceType;
  submitterId: string;
  submitterName: string;
  submitterEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  estimatedHours?: number;
  actualHours?: number;
  requiredByDate?: string;
  createdDate: string;
  lastModifiedDate: string;
  approvalStatus?: 'Not Required' | 'Pending' | 'Approved' | 'Rejected';
  approvalComments?: string;
  approverId?: string;
  businessJustification?: string;
  technicalComplexity?: 'Low' | 'Medium' | 'High';
  riskLevel?: 'Low' | 'Medium' | 'High';
  testingRequired?: boolean;
  documentationRequired?: boolean;
  attachments?: FileAttachment[];
}

export interface CreateSDRFormData {
  title: string;
  description: string;
  priority: Priority;
  customerType: CustomerType;
  requiredByDate?: string;
  businessJustification?: string;
  attachments?: File[];
}

export interface UpdateSDRFormData extends Partial<CreateSDRFormData> {
  status?: SDRStatus;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  technicalComplexity?: 'Low' | 'Medium' | 'High';
  riskLevel?: 'Low' | 'Medium' | 'High';
  testingRequired?: boolean;
  documentationRequired?: boolean;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface SDRFilters {
  status?: SDRStatus[];
  priority?: Priority[];
  assignedTo?: string;
  submitterId?: string;
  customerType?: CustomerType;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SDRListResponse {
  data: SDR[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SDRComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdDate: string;
  type: 'General' | 'Technical' | 'Approval' | 'Status Change';
}

export interface SDRHistory {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedDate: string;
  reason?: string;
}