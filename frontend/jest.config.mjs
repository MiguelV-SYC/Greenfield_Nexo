import nextJest from "next/jest.js"

const crearConfiguracion = nextJest({ dir: "./" })

/** @type {import('jest').Config} */
export default crearConfiguracion({
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["<rootDir>/src/**/*.spec.{ts,tsx}"],
  // stack/testing.md: 80 % de líneas. Se mide sobre el código de esta
  // feature (src/lib/api, src/components/organizaciones). Las páginas de
  // src/app solo componen y, como las pantallas del kit aprobado (landing,
  // login, shell V5, fondos, logo 3D), se cubren con los E2E (T20).
  collectCoverageFrom: [
    "src/lib/api/**/*.ts",
    "!src/lib/api/esquema.ts",
    "src/components/organizaciones/**/*.tsx",
    // Componentes visuales del kit (sin lógica de la feature).
    "!src/components/organizaciones/{Hero,Topbar,BottomBanner}.tsx",
    "!src/**/*.spec.{ts,tsx}",
  ],
  coverageThreshold: { global: { lines: 80 } },
})
