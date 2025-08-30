module.exports = {
  displayName: 'E2E Tests',
  testEnvironment: 'node',
  rootDir: '../../',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'apps/**/*.ts',
    '!apps/**/*.d.ts',
    '!apps/**/dist/**',
    '!apps/**/node_modules/**',
  ],
  coverageDirectory: '<rootDir>/tests/coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 1, // Run E2E tests sequentially
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};