import { APIClient } from '../utils/APIClient';
import { TestDataFactory } from '../utils/TestDataFactory';
import { SDR, CreateSDRRequest } from '../../../apps/frontend/src/features/sdr/types/sdr.types';

describe('SDR Lifecycle E2E Tests', () => {
  let apiClient: APIClient;
  let testData: TestDataFactory;
  let createdSDR: SDR;

  beforeAll(async () => {
    apiClient = new APIClient();
    testData = new TestDataFactory();
    await apiClient.authenticate();
  });

  afterAll(async () => {
    // Cleanup created test data
    if (createdSDR?.id) {
      try {
        await apiClient.deleteSDR(createdSDR.id);
      } catch (error) {
        console.warn('Failed to cleanup test SDR:', error);
      }
    }
  });

  describe('SDR Creation', () => {
    it('should create a new SDR successfully', async () => {
      const sdrData: CreateSDRRequest = testData.createSDRRequest({
        title: 'E2E Test SDR - Creation',
        description: 'This is a test SDR created by automated E2E tests',
        priority: 'Medium',
        customerType: 'Internal'
      });

      const response = await apiClient.createSDR(sdrData);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.title).toBe(sdrData.title);
      expect(response.data.description).toBe(sdrData.description);
      expect(response.data.priority).toBe(sdrData.priority);
      expect(response.data.status).toBe('New');

      createdSDR = response.data;
    });

    it('should validate required fields when creating SDR', async () => {
      const invalidSDRData = {
        // Missing required fields
        description: 'Test description'
      };

      await expect(
        apiClient.createSDR(invalidSDRData as CreateSDRRequest)
      ).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('Validation failed')
      });
    });
  });

  describe('SDR Retrieval', () => {
    it('should retrieve SDR by ID', async () => {
      const response = await apiClient.getSDR(createdSDR.id);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.id).toBe(createdSDR.id);
      expect(response.data.title).toBe(createdSDR.title);
    });

    it('should return 404 for non-existent SDR', async () => {
      await expect(
        apiClient.getSDR(999999)
      ).rejects.toMatchObject({
        status: 404
      });
    });

    it('should list SDRs with pagination', async () => {
      const response = await apiClient.listSDRs({ page: 1, limit: 10 });

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.pagination).toBeDefined();
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.limit).toBe(10);
    });
  });

  describe('SDR Updates', () => {
    it('should update SDR status', async () => {
      const updateData = {
        status: 'Active' as const
      };

      const response = await apiClient.updateSDR(createdSDR.id, updateData);

      expect(response.success).toBe(true);
      expect(response.data.status).toBe('Active');
    });

    it('should update SDR assignment', async () => {
      const updateData = {
        assignedTo: 'test.developer@company.com',
        assignedToName: 'Test Developer'
      };

      const response = await apiClient.updateSDR(createdSDR.id, updateData);

      expect(response.success).toBe(true);
      expect(response.data.assignedTo).toBe(updateData.assignedTo);
      expect(response.data.assignedToName).toBe(updateData.assignedToName);
    });

    it('should update estimated hours', async () => {
      const updateData = {
        estimatedHours: 8
      };

      const response = await apiClient.updateSDR(createdSDR.id, updateData);

      expect(response.success).toBe(true);
      expect(response.data.estimatedHours).toBe(8);
    });
  });

  describe('SDR Status Transitions', () => {
    it('should transition through valid status states', async () => {
      const statusTransitions = [
        'New',
        'Active',
        'Resolved',
        'Closed'
      ] as const;

      for (let i = 1; i < statusTransitions.length; i++) {
        const newStatus = statusTransitions[i];
        const response = await apiClient.updateSDR(createdSDR.id, { status: newStatus });

        expect(response.success).toBe(true);
        expect(response.data.status).toBe(newStatus);
      }
    });
  });

  describe('SDR Filtering and Search', () => {
    it('should filter SDRs by status', async () => {
      const response = await apiClient.listSDRs({ 
        filters: { status: ['Active'] }
      });

      expect(response.success).toBe(true);
      response.data.forEach((sdr: SDR) => {
        expect(sdr.status).toBe('Active');
      });
    });

    it('should filter SDRs by priority', async () => {
      const response = await apiClient.listSDRs({ 
        filters: { priority: ['High', 'Critical'] }
      });

      expect(response.success).toBe(true);
      response.data.forEach((sdr: SDR) => {
        expect(['High', 'Critical']).toContain(sdr.priority);
      });
    });

    it('should search SDRs by title and description', async () => {
      const searchTerm = 'E2E Test';
      const response = await apiClient.searchSDRs(searchTerm);

      expect(response.success).toBe(true);
      response.data.forEach((sdr: SDR) => {
        expect(
          sdr.title.includes(searchTerm) || sdr.description.includes(searchTerm)
        ).toBe(true);
      });
    });
  });
});