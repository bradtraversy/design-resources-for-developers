import { FullConfig } from '@playwright/test';

export default async function globalTeardown(config: FullConfig) {
  void config;
  // Clean up after tests if needed
  console.log('Global teardown: Cleaning up test environment...');

  // Could clean up test data, close connections, etc.

  console.log('Global teardown complete');
}
