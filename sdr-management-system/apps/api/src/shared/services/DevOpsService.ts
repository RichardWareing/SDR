import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import type { 
  DevOpsConfig, 
  DevOpsWorkItem, 
  CreateWorkItemRequest,
  UpdateWorkItemRequest,
  WorkItemQuery 
} from '../types/devops.types';

export class DevOpsService {
  private readonly httpClient: AxiosInstance;
  private readonly organization: string;
  private patToken: string | null = null;

  constructor(config?: DevOpsConfig) {
    this.organization = config?.organization || process.env.DEVOPS_ORGANIZATION!;
    
    this.httpClient = axios.create({
      baseURL: `https://dev.azure.com/${this.organization}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json-patch+json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.httpClient.interceptors.request.use(
      async (config) => {
        const token = await this.getPATToken();
        config.headers['Authorization'] = `Basic ${Buffer.from(`:${token}`).toString('base64')}`;
        config.headers['X-Request-ID'] = this.generateRequestId();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with retry logic
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        // Retry on rate limiting
        if (error.response?.status === 429 && !config._retry) {
          config._retry = true;
          const retryAfter = error.response.headers['retry-after'] || 5;
          await this.delay(retryAfter * 1000);
          return this.httpClient.request(config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async getPATToken(): Promise<string> {
    if (this.patToken) {
      return this.patToken;
    }

    try {
      const credential = new DefaultAzureCredential();
      const keyVaultUrl = process.env.KEY_VAULT_URL!;
      const secretClient = new SecretClient(keyVaultUrl, credential);
      
      const secret = await secretClient.getSecret('devops-pat-token');
      this.patToken = secret.value!;
      
      return this.patToken;
    } catch (error) {
      throw new Error(`Failed to retrieve PAT token from Key Vault: ${error}`);
    }
  }

  async createWorkItem(project: string, data: CreateWorkItemRequest): Promise<DevOpsWorkItem> {
    const patchDocument = this.buildPatchDocument(data);
    
    try {
      const response: AxiosResponse<DevOpsWorkItem> = await this.httpClient.post(
        `/${project}/_apis/wit/workitems/$SDR Request?api-version=7.0`,
        patchDocument
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create work item: ${error}`);
    }
  }

  async getWorkItem(project: string, id: number): Promise<DevOpsWorkItem> {
    try {
      const response: AxiosResponse<DevOpsWorkItem> = await this.httpClient.get(
        `/${project}/_apis/wit/workitems/${id}?api-version=7.0`
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get work item ${id}: ${error}`);
    }
  }

  async updateWorkItem(project: string, id: number, data: UpdateWorkItemRequest): Promise<DevOpsWorkItem> {
    const patchDocument = this.buildPatchDocument(data);
    
    try {
      const response: AxiosResponse<DevOpsWorkItem> = await this.httpClient.patch(
        `/${project}/_apis/wit/workitems/${id}?api-version=7.0`,
        patchDocument
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to update work item ${id}: ${error}`);
    }
  }

  async queryWorkItems(query: WorkItemQuery): Promise<DevOpsWorkItem[]> {
    try {
      const wiqlQuery = this.buildWiqlQuery(query);
      
      const queryResponse = await this.httpClient.post(
        `/_apis/wit/wiql?api-version=7.0`,
        { query: wiqlQuery }
      );

      const workItemIds = queryResponse.data.workItems.map((wi: any) => wi.id);
      
      if (workItemIds.length === 0) {
        return [];
      }

      const workItemsResponse: AxiosResponse<{ value: DevOpsWorkItem[] }> = await this.httpClient.get(
        `/_apis/wit/workitems?ids=${workItemIds.join(',')}&$expand=all&api-version=7.0`
      );

      return workItemsResponse.data.value;
    } catch (error) {
      throw new Error(`Failed to query work items: ${error}`);
    }
  }

  private buildPatchDocument(data: any): Array<{ op: string; path: string; value: any }> {
    const patchDocument = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        const fieldPath = this.getFieldPath(key);
        patchDocument.push({
          op: 'add',
          path: fieldPath,
          value: value
        });
      }
    }
    
    return patchDocument;
  }

  private getFieldPath(fieldName: string): string {
    const fieldMapping: Record<string, string> = {
      title: '/fields/System.Title',
      description: '/fields/System.Description',
      state: '/fields/System.State',
      assignedTo: '/fields/System.AssignedTo',
      submitterId: '/fields/Custom.SubmitterId',
      submitterEmail: '/fields/Custom.SubmitterEmail',
      customerType: '/fields/Custom.CustomerType',
      priority: '/fields/Custom.Priority',
      requiredByDate: '/fields/Custom.RequiredByDate',
      estimatedHours: '/fields/Custom.EstimatedHours',
      sourceType: '/fields/Custom.SourceType',
      approvalStatus: '/fields/Custom.ApprovalStatus'
    };

    return fieldMapping[fieldName] || `/fields/Custom.${fieldName}`;
  }

  private buildWiqlQuery(query: WorkItemQuery): string {
    let wiql = `SELECT [System.Id], [System.Title], [System.State], [Custom.Priority] FROM workitems WHERE [System.WorkItemType] = 'SDR Request'`;
    
    if (query.submitterId) {
      wiql += ` AND [Custom.SubmitterId] = '${query.submitterId}'`;
    }
    
    if (query.assignedTo) {
      wiql += ` AND [System.AssignedTo] = '${query.assignedTo}'`;
    }
    
    if (query.state) {
      wiql += ` AND [System.State] = '${query.state}'`;
    }
    
    if (query.priority) {
      wiql += ` AND [Custom.Priority] = '${query.priority}'`;
    }

    wiql += ` ORDER BY [System.ChangedDate] DESC`;
    
    return wiql;
  }

  private generateRequestId(): string {
    return `sdr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.httpClient.get('/_apis/projects?api-version=7.0');
      return true;
    } catch (error) {
      return false;
    }
  }
}