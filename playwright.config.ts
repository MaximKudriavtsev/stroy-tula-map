import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  timeout: 180_000,
  webServer: [
    {
      command: 'pnpm --filter @tula/api dev',
      url: 'http://127.0.0.1:3000/health/live',
      reuseExistingServer: true,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        API_MODE: 'mock',
        ALLOW_DEV_ROUTES: 'true',
      },
    },
    {
      command: 'pnpm --filter @tula/public-web dev',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: true,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'pnpm --filter @tula/admin-web dev',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: true,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
