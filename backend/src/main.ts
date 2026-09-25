import "@/cargar-entorno"
import "reflect-metadata"
import { NestFactory } from "@nestjs/core"

import { AppModule } from "@/app.module"
import { configurarAplicacion } from "@/app.setup"
import { leerConfiguracion } from "@/common/configuracion"

async function iniciar(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  configurarAplicacion(app)
  await app.listen(leerConfiguracion().puerto)
}

void iniciar()
