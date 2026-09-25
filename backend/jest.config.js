const base = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  transform: { "^.+\.(t|j)s$": "ts-jest" },
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  resolver: "<rootDir>/jest.resolver.js",
  testEnvironment: "node",
}

/** @type {import('jest').Config} */
module.exports = {
  // stack/testing.md: la cobertura se mide por paquete, sumando unit e integración.
  projects: [
    { ...base, displayName: "unit", testRegex: "src/.*\.spec\.ts$" },
    {
      ...base,
      displayName: "integracion",
      testRegex: "test/.*\.e2e-spec\.ts$",
      globalSetup: "<rootDir>/test/utilidades/migrar-base-pruebas.ts",
      setupFiles: ["<rootDir>/test/utilidades/configurar-entorno.ts"],
    },
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/main.ts",
    "!src/cargar-entorno.ts",
    "!src/cli/**",
    "!src/**/*.module.ts",
    "!src/**/dto/**",
    "!src/generated/**",
  ],
  coverageDirectory: "./coverage",
  coverageThreshold: { global: { lines: 80 } },
}
