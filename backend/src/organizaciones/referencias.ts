import type { ErrorDeCampo } from "@/common/validacion/errores-validacion"
import type { PrismaService } from "@/common/prisma/prisma.service"
import { esDigitoVerificacionValido } from "./dominio/digito-verificacion"
import type {
  RegistrarOrganizacionDto,
  SedeDto,
} from "./dto/registrar-organizacion.dto"

function error(campo: string, mensaje: string): ErrorDeCampo {
  return { campo, mensajes: [mensaje] }
}

async function erroresDeSede(
  prisma: PrismaService,
  sede: SedeDto,
  i: number,
): Promise<ErrorDeCampo[]> {
  const [municipio, actividad] = await Promise.all([
    prisma.municipio.findFirst({
      where: {
        codigo: sede.municipioCodigo,
        departamentoCodigo: sede.departamentoCodigo,
      },
      select: { codigo: true },
    }),
    prisma.actividadCiiu.findUnique({
      where: { codigo: sede.ciiuCodigo },
      select: { codigo: true },
    }),
  ])
  const errores: ErrorDeCampo[] = []
  if (!municipio) {
    // R2.5 / R2.6: el municipio existe y pertenece al departamento elegido.
    errores.push(
      error(
        `sedes.${i}.municipioCodigo`,
        "El municipio no pertenece al departamento",
      ),
    )
  }
  if (!actividad) {
    errores.push(
      error(
        `sedes.${i}.ciiuCodigo`,
        "La actividad no está en el catálogo CIIU",
      ),
    )
  }
  return errores
}

/**
 * Reglas que class-validator no puede comprobar solo: DV del NIT (R1.6) y
 * referencias a los catálogos (R1.9, R2.5–R2.7). Devuelve todos los campos
 * con error para que el asistente los marque a la vez.
 */
export async function validarReferencias(
  prisma: PrismaService,
  datos: RegistrarOrganizacionDto,
): Promise<ErrorDeCampo[]> {
  const errores: ErrorDeCampo[] = []
  if (!esDigitoVerificacionValido(datos.nit, datos.digitoVerificacion)) {
    errores.push(
      error(
        "digitoVerificacion",
        "El dígito de verificación no corresponde al NIT",
      ),
    )
  }
  if (datos.arlCodigo !== undefined) {
    const arl = await prisma.arl.findUnique({
      where: { codigo: datos.arlCodigo },
    })
    if (!arl) errores.push(error("arlCodigo", "La ARL no está en el catálogo"))
  }
  const porSede = await Promise.all(
    datos.sedes.map((sede, i) => erroresDeSede(prisma, sede, i)),
  )
  return [...errores, ...porSede.flat()]
}
