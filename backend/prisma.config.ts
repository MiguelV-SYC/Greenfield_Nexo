import { defineConfig, env } from "prisma/config"

// Prisma 7 no carga .env por su cuenta. Las variables ya definidas en el
// entorno (CI, `node --env-file`) tienen prioridad sobre el archivo.
try {
  process.loadEnvFile(".env")
} catch {
  // Sin .env: se usan las variables del entorno.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node dist/cli/sembrar-catalogos.js",
  },
  // La CLI (migrate, seed) usa el rol dueño del esquema; la aplicación usa
  // DATABASE_URL con nexo_app (ADR-0001).
  datasource: { url: env("DATABASE_URL_MIGRACIONES") },
})
