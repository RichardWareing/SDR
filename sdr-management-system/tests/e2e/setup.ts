import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.resolve(__dirname, '.env.test') });

// Global test setup
beforeAll(async () => {
  // Setup test environment
  console.log('Setting up E2E test environment...');
  
  // Verify required environment variables
  const requiredVars = [
    'TEST_API_BASE_URL',
    'TEST_FRONTEND_BASE_URL',
    'AZURE_CLIENT_ID',
    'AZURE_CLIENT_SECRET',
    'AZURE_TENANT_ID'
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.warn(`Warning: ${varName} not set in test environment`);
    }
  }
});

afterAll(async () => {
  // Cleanup test environment
  console.log('Cleaning up E2E test environment...');
});

// Global test timeout
jest.setTimeout(30000);