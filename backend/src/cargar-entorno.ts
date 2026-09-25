import { existsSync } from "node:fs"

// Primer import de cada punto de entrada (main.ts, cli/*): AppModule lee la
// configuración al importarse. Desarrollo local: backend/.env; las variables
// ya definidas en el entorno tienen prioridad.
if (existsSync(".env")) process.loadEnvFile(".env")
