import { api, type Esquemas, exigir } from "@/lib/api/cliente"

export type Caso = Esquemas["CasoValidacionDto"]
export type DetalleOrganizacion = Esquemas["OrganizacionDto"]

/** Lo que la cola necesita del backend (R4.3–R4.5, R5.8, R5.9). */
export interface ServiciosValidacion {
  cola(): Promise<Caso[]>
  detalle(id: string): Promise<DetalleOrganizacion>
  aprobar(id: string): Promise<void>
  devolver(id: string, motivo: string): Promise<void>
}

export const serviciosValidacionApi: ServiciosValidacion = {
  async cola() {
    return exigir(await api.GET("/api/v1/admin/organizaciones/validacion"))
  },
  async detalle(id) {
    return exigir(
      await api.GET("/api/v1/organizaciones/{id}", {
        params: { path: { id } },
      }),
    )
  },
  async aprobar(id) {
    exigir(
      await api.POST("/api/v1/admin/organizaciones/{id}/aprobacion", {
        params: { path: { id } },
      }),
    )
  },
  async devolver(id, motivo) {
    exigir(
      await api.POST("/api/v1/admin/organizaciones/{id}/devolucion", {
        params: { path: { id } },
        body: { motivo },
      }),
    )
  },
}
