import { type INestApplication, ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { Logger } from "nestjs-pino"

export const PREFIJO_API = "api/v1"

export function configurarAplicacion(app: INestApplication): void {
  app.useLogger(app.get(Logger))
  app.setGlobalPrefix(PREFIJO_API)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("Nexo API").setVersion("1").build(),
  )
  SwaggerModule.setup("api/docs", app, documento)
}
