import { Module } from "@nestjs/common"

import { AlmacenamientoArchivos } from "./almacenamiento-archivos"
import { AlmacenamientoMinio } from "./almacenamiento-minio"
import { leerConfiguracionAlmacenamiento } from "./configuracion-almacenamiento"

@Module({
  providers: [
    {
      provide: AlmacenamientoArchivos,
      useFactory: () =>
        new AlmacenamientoMinio(leerConfiguracionAlmacenamiento()),
    },
  ],
  exports: [AlmacenamientoArchivos],
})
export class AlmacenamientoModule {}
