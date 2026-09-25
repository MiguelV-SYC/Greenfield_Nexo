import { Module } from "@nestjs/common"

import { CatalogosModule } from "./catalogos/catalogos.module"
import { EstandaresController } from "./estandares.controller"
import { OrganizacionesController } from "./organizaciones.controller"
import { OrganizacionesService } from "./organizaciones.service"

@Module({
  imports: [CatalogosModule],
  controllers: [EstandaresController, OrganizacionesController],
  providers: [OrganizacionesService],
  exports: [OrganizacionesService],
})
export class OrganizacionesModule {}
