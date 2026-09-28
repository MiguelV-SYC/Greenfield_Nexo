import { Module } from "@nestjs/common"

import { AlmacenamientoModule } from "@/infra/almacenamiento/almacenamiento.module"
import { AdminValidacionController } from "./admin-validacion.controller"
import { CatalogosModule } from "./catalogos/catalogos.module"
import { CorreccionService } from "./correccion.service"
import { DocumentosController } from "./documentos/documentos.controller"
import { DocumentosService } from "./documentos/documentos.service"
import { EstandaresController } from "./estandares.controller"
import { OrganizacionesController } from "./organizaciones.controller"
import { OrganizacionesService } from "./organizaciones.service"
import { ValidacionService } from "./validacion.service"

@Module({
  imports: [AlmacenamientoModule, CatalogosModule],
  controllers: [
    EstandaresController,
    OrganizacionesController,
    AdminValidacionController,
    DocumentosController,
  ],
  providers: [
    OrganizacionesService,
    ValidacionService,
    CorreccionService,
    DocumentosService,
  ],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}
