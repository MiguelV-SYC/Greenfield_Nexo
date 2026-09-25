import { type INestApplication, ValidationPipe } from "@nestjs/common"
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from "@nestjs/swagger"
import { Logger } from "nestjs-pino"

import { crearExcepcionValidacion } from "@/common/validacion/errores-validacion"

export const PREFIJO_API = "api/v1"

/** Contrato OpenAPI de la API; lo consume el frontend (tipos generados). */
export function crearDocumentoOpenApi(app: INestApplication): OpenAPIObject {
  return SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("Nexo API").setVersion("1").build(),
  )
}

export function configurarAplicacion(app: INestApplication): void {
  app.useLogger(app.get(Logger))
  app.setGlobalPrefix(PREFIJO_API)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: crearExcepcionValidacion,
    }),
  )
  SwaggerModule.setup("api/docs", app, crearDocumentoOpenApi(app))
}
