const base = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  transform: { "^.+\.(t|j)s$": "ts-jest" },
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
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
    },
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.spec.ts",
    "!src/main.ts",
    "!src/**/*.module.ts",
    "!src/**/dto/**",
  ],
  coverageDirectory: "./coverage",
  coverageThreshold: { global: { lines: 80 } },
}
