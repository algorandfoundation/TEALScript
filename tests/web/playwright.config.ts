// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: '*.playwright.ts',
  webServer: {
    command: 'bun server.ts',
    url: 'http://127.0.0.1:3000',
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
