// Derived from T5 (acceso a datos con el rol de la aplicación; ADR-0001)
import { urlBaseAplicacion } from "./prisma.service"

describe("urlBaseAplicacion", () => {
  it("devuelve DATABASE_URL", () => {
    expect(urlBaseAplicacion({ DATABASE_URL: "postgresql://x" })).toBe(
      "postgresql://x",
    )
  })

  it("falla si DATABASE_URL no está definida", () => {
    expect(() => urlBaseAplicacion({})).toThrow("DATABASE_URL")
  })
})
