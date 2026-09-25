import { Module } from "@nestjs/common"

import { CatalogosModule } from "./catalogos/catalogos.module"
import { EstandaresController } from "./estandares.controller"

@Module({
  imports: [CatalogosModule],
  controllers: [EstandaresController],
})
export class OrganizacionesModule {}
