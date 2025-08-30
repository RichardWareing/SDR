// SDRService - Main service for SDR operations
// Phase 1 Implementation

import { DevOpsService } from './DevOpsService';
import { ValidationService } from './ValidationService';
import { SDR, SDRStatus, SDRPriority, CreateSDRRequest, CustomerType, SourceType } from '../../../../shared/src/types';
import { Logger } from '../utils/logger';

export class SDRService {
  private devOpsService: DevOpsService;
  private validationService: ValidationService;
  private logger: Logger;

  constructor() {
    this.devOpsService = new DevOpsService();
    this.validationService = new ValidationService();
    this.logger = new Logger('SDRService');
  }

  async createSDR(sdrData: CreateSDRRequest): Promise<SDR> {
    try {
      this.logger.info(`Creating SDR for user ${sdrData.submitterId}`);

      // Enrich SDR data with defaults for Phase 1
      const enrichedData: CreateSDRRequest = {
        ...sdrData,
        priority: sdrData.priority || SDRPriority.Medium,
        customerType: sdrData.customerType || CustomerType.Internal,
        requiredByDate: sdrData.requiredByDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        sourceType: sdrData.sourceType || SourceType.Manual
      };

      // Validate the enriched data
      const validation = this.validationService.validateSDRPayload(enrichedData);
      if (!validation.isValid) {
        throw new ValidationError('Invalid SDR data', validation.errors);
      }

      // Create work item in DevOps
      const workItem = await this.devOpsService.createSDRWorkItem(enrichedData);

      // Map DevOps work item to SDR format
      const sdr: SDR = {
        id: workItem.id,
        workItemId: workItem.id,
        title: enrichedData.title,
        description: enrichedData.description,
        status: SDRStatus.New,
        priority: enrichedData.priority,
        requiredByDate: enrichedData.requiredByDate,
        customerType: enrichedData.customerType,
        sourceType: enrichedData.sourceType,
        submitterId: enrichedData.submitterId!,
        submitterEmail: enrichedData.submitterEmail!,
        submitterName: enrichedData.submitterName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.logger.info(`SDR ${sdr.id} created successfully`);
      return sdr;

    } catch (error) {
      this.logger.error('Failed to create SDR', error);
      throw error;
    }
  }

  async getSDRs(userId: string): Promise<SDR[]> {
    try {
      this.logger.info(`Fetching SDRs for user ${userId}`);

      // Query DevOps for user's work items
      const workItems = await this.devOpsService.getUserSDRWorkItems(userId);

      // Map to SDR format
      const sdrs: SDR[] = workItems.map(workItem => ({
        id: workItem.id,
        workItemId: workItem.id,
        title: workItem.fields['System.Title'] || '',
        description: workItem.fields['System.Description'] || '',
        status: workItem.fields['System.State'] as SDRStatus || SDRStatus.New,
        priority: workItem.fields['Custom.Priority'] as SDRPriority || SDRPriority.Medium,
        requiredByDate: workItem.fields['Custom.RequiredByDate'],
        customerType: workItem.fields['Custom.CustomerType'] as CustomerType || CustomerType.Internal,
        sourceType: workItem.fields['Custom.SourceType'] as SourceType || SourceType.Manual,
        submitterId: workItem.fields['Custom.SubmitterId'] || '',
        submitterEmail: workItem.fields['Custom.SubmitterEmail'] || '',
        submitterName: workItem.fields['Custom.SubmitterName'],
        createdAt: workItem.fields['System.CreatedDate'] || new Date().toISOString(),
        updatedAt: workItem.fields['System.ChangedDate'] || new Date().toISOString()
      }));

      this.logger.info(`Retrieved ${sdrs.length} SDRs for user ${userId}`);
      return sdrs;

    } catch (error) {
      this.logger.error('Failed to fetch SDRs', error);
      throw error;
    }
  }

  async getSDR(id: number): Promise<SDR> {
    try {
      this.logger.info(`Fetching SDR ${id}`);

      // Get work item from DevOps
      const workItem = await this.devOpsService.getSDRWorkItem(id);

      // Map to SDR format
      const sdr: SDR = {
        id: workItem.id,
        workItemId: workItem.id,
        title: workItem.fields['System.Title'] || '',
        description: workItem.fields['System.Description'] || '',
        status: workItem.fields['System.State'] as SDRStatus || SDRStatus.New,
        priority: workItem.fields['Custom.Priority'] as SDRPriority || SDRPriority.Medium,
        requiredByDate: workItem.fields['Custom.RequiredByDate'],
        customerType: workItem.fields['Custom.CustomerType'] as CustomerType || CustomerType.Internal,
        sourceType: workItem.fields['Custom.SourceType'] as SourceType || SourceType.Manual,
        submitterId: workItem.fields['Custom.SubmitterId'] || '',
        submitterEmail: workItem.fields['Custom.SubmitterEmail'] || '',
        submitterName: workItem.fields['Custom.SubmitterName'],
        createdAt: workItem.fields['System.CreatedDate'] || new Date().toISOString(),
        updatedAt: workItem.fields['System.ChangedDate'] || new Date().toISOString()
      };

      return sdr;

    } catch (error) {
      this.logger.error(`Failed to fetch SDR ${id}`, error);
      throw error;
    }
  }

  async updateSDR(id: number, updates: Partial<SDR>): Promise<SDR> {
    try {
      this.logger.info(`Updating SDR ${id}`);

      // Update work item in DevOps
      const updatedWorkItem = await this.devOpsService.updateSDRWorkItem(id, updates);

      // Fetch updated SDR
      const updatedSDR = await this.getSDR(id);

      this.logger.info(`SDR ${id} updated successfully`);
      return updatedSDR;

    } catch (error) {
      this.logger.error(`Failed to update SDR ${id}`, error);
      throw error;
    }
  }

  async deleteSDR(id: number): Promise<void> {
    try {
      this.logger.info(`Deleting SDR ${id}`);

      // Delete work item (Phase 1: soft delete by changing state)
      await this.devOpsService.updateSDRWorkItem(id, { status: SDRStatus.Closed });

      this.logger.info(`SDR ${id} deleted successfully`);

    } catch (error) {
      this.logger.error(`Failed to delete SDR ${id}`, error);
      throw error;
    }
  }
}

// Custom errors
export class ValidationError extends Error {
  constructor(message: string, public errors: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}