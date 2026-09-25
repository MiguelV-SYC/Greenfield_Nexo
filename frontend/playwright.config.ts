import { defineConfig, devices } from "@playwright/test"

import {
  DIR_BACKEND,
  entornoPruebas,
  PUERTO_API,
  PUERTO_WEB,
} from "./e2e/entorno"

// stack/testing.md: E2E con Playwright contra backend real (base nexo_pruebas)
// y el frontend en modo desarrollo, que reenvía /api/v1 al backend.
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  globalSetup: "./e2e/preparar-base.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PUERTO_WEB}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node dist/main.js",
      cwd: DIR_BACKEND,
      url: `http://127.0.0.1:${PUERTO_API}/api/docs-json`,
      env: {
        ...entornoPruebas(),
        PORT: String(PUERTO_API),
        AUTH_MODO: "mock",
        NODE_ENV: "test",
        LOG_LEVEL: "warn",
      },
      timeout: 60_000,
    },
    {
      command: `npx next dev -p ${PUERTO_WEB}`,
      url: `http://127.0.0.1:${PUERTO_WEB}/login`,
      env: {
        NEXO_API_URL: `http://127.0.0.1:${PUERTO_API}`,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      timeout: 180_000,
    },
  ],
})
