import type { Organizacion, Sede } from "@/generated/prisma/client"
import type { OrganizacionDto, SedeRegistradaDto } from "./dto/organizacion.dto"

export type OrganizacionConSedes = Organizacion & { sedes: Sede[] }

export function nombreVisible(
  o: Pick<Organizacion, "nombreComercial" | "razonSocial">,
): string {
  return o.nombreComercial ?? o.razonSocial
}

function aSede(s: Sede): SedeRegistradaDto {
  return {
    id: s.id,
    nombre: s.nombre,
    direccion: s.direccion,
    departamentoCodigo: s.departamentoCodigo,
    municipioCodigo: s.municipioCodigo,
    claseRiesgo: s.claseRiesgo,
    trabajadores: s.trabajadores,
    ciiuCodigo: s.ciiuCodigo,
  }
}

/** Lo que la API expone de una organización (R5.9); nada interno de la tabla. */
export function aDetalle(o: OrganizacionConSedes): OrganizacionDto {
  return {
    id: o.id,
    razonSocial: o.razonSocial,
    nombreComercial: o.nombreComercial,
    nombreVisible: nombreVisible(o),
    tipoPersona: o.tipoPersona,
    nit: o.nit,
    digitoVerificacion: o.digitoVerificacion,
    repLegalNombre: o.repLegalNombre,
    repLegalTipoDoc: o.repLegalTipoDoc,
    repLegalNumeroDoc: o.repLegalNumeroDoc,
    arlCodigo: o.arlCodigo,
    estado: o.estado,
    motivoDevolucion: o.motivoDevolucion,
    enviadaEn: o.enviadaEn,
    riesgoMaximo: o.riesgoMaximo,
    totalTrabajadores: o.totalTrabajadores,
    estandaresAplicables: o.estandaresAplicables,
    sedes: o.sedes.map(aSede),
  }
}
