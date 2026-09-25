import { Module } from "@nestjs/common"

import { AdminValidacionController } from "./admin-validacion.controller"
import { CatalogosModule } from "./catalogos/catalogos.module"
import { EstandaresController } from "./estandares.controller"
import { OrganizacionesController } from "./organizaciones.controller"
import { OrganizacionesService } from "./organizaciones.service"
import { ValidacionService } from "./validacion.service"

@Module({
  imports: [CatalogosModule],
  controllers: [
    EstandaresController,
    OrganizacionesController,
    AdminValidacionController,
  ],
  providers: [OrganizacionesService, ValidacionService],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}
