import { api, type Esquemas, exigir } from "@/lib/api/cliente"
import type { CuerpoRegistro } from "./formulario"

export interface Opcion {
  codigo: string
  nombre: string
}

export type ActividadCiiu = Esquemas["ActividadCiiuDto"]
export type Estandares = Esquemas["EstandaresAplicablesDto"]
export type Organizacion = Esquemas["OrganizacionDto"]
export type SedeRiesgo = Esquemas["SedeRiesgoDto"]

/** Lo que el asistente necesita del backend; los tests lo sustituyen. */
export interface ServiciosAsistente {
  departamentos(): Promise<Opcion[]>
  municipios(departamentoCodigo: string): Promise<Opcion[]>
  arl(): Promise<Opcion[]>
  buscarCiiu(consulta: string): Promise<ActividadCiiu[]>
  calcularEstandares(sedes: SedeRiesgo[]): Promise<Estandares>
  registrar(cuerpo: CuerpoRegistro): Promise<Organizacion>
}

export const serviciosApi: ServiciosAsistente = {
  async departamentos() {
    return exigir(await api.GET("/api/v1/catalogos/departamentos"))
  },
  async municipios(codigo) {
    return exigir(
      await api.GET("/api/v1/catalogos/departamentos/{codigo}/municipios", {
        params: { path: { codigo } },
      }),
    )
  },
  async arl() {
    return exigir(await api.GET("/api/v1/catalogos/arl"))
  },
  async buscarCiiu(q) {
    return exigir(
      await api.GET("/api/v1/catalogos/ciiu", { params: { query: { q } } }),
    )
  },
  async calcularEstandares(sedes) {
    return exigir(
      await api.POST("/api/v1/estandares-aplicables/calculo", {
        body: { sedes },
      }),
    )
  },
  async registrar(cuerpo) {
    return exigir(await api.POST("/api/v1/organizaciones", { body: cuerpo }))
  },
}
