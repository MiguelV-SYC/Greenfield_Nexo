import { ApiProperty } from "@nestjs/swagger"

export class DepartamentoDto {
  @ApiProperty({ example: "68" }) codigo: string
  @ApiProperty({ example: "SANTANDER" }) nombre: string
}

export class MunicipioDto {
  @ApiProperty({ example: "68679" }) codigo: string
  @ApiProperty({ example: "SAN GIL" }) nombre: string
}

export class ActividadCiiuDto {
  @ApiProperty({ example: "6201" }) codigo: string
  @ApiProperty({
    example: "Actividades de desarrollo de sistemas informáticos",
  })
  descripcion: string
}

export class ArlDto {
  @ApiProperty({ example: "aurora" }) codigo: string
  @ApiProperty({ example: "Aurora" }) nombre: string
}
