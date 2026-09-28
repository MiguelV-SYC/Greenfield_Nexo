import {
  DOCUMENTOS_LEGALES,
  detectarTipoArchivo,
  documentosFaltantes,
} from "./documentos-legales"

const bytes = (...partes: (string | number[])[]) =>
  Buffer.concat(
    partes.map((p) =>
      typeof p === "string" ? Buffer.from(p, "latin1") : Buffer.from(p),
    ),
  )

describe("documentos legales", () => {
  // Derived from R7.1
  it("define cuatro obligatorios y el de no afiliación como opcional", () => {
    expect(
      DOCUMENTOS_LEGALES.filter((d) => d.obligatorio).map((d) => d.tipo),
    ).toEqual(["RUT", "CAMARA_COMERCIO", "CEDULA_REP_LEGAL", "FORMULARIO_ARL"])
    expect(
      DOCUMENTOS_LEGALES.find((d) => d.tipo === "NO_AFILIACION_ARL"),
    ).toMatchObject({ obligatorio: false })
  })

  describe("documentosFaltantes", () => {
    // Derived from R7.5
    it("lista los obligatorios que no se cargaron, en orden", () => {
      expect(
        documentosFaltantes(["CAMARA_COMERCIO", "NO_AFILIACION_ARL"]),
      ).toEqual(["RUT", "CEDULA_REP_LEGAL", "FORMULARIO_ARL"])
    })

    it("no exige el certificado de no afiliación", () => {
      expect(
        documentosFaltantes([
          "RUT",
          "CAMARA_COMERCIO",
          "CEDULA_REP_LEGAL",
          "FORMULARIO_ARL",
        ]),
      ).toEqual([])
    })
  })

  describe("detectarTipoArchivo", () => {
    // Derived from R7.2
    it.each([
      ["PDF", bytes("%PDF-1.7\n..."), "application/pdf"],
      ["JPEG", bytes([0xff, 0xd8, 0xff, 0xe0], "JFIF"), "image/jpeg"],
      ["PNG", bytes([0x89], "PNG\r\n", [0x1a, 0x0a], "IHDR"), "image/png"],
      ["WebP", bytes("RIFF", [0x24, 0, 0, 0], "WEBPVP8 "), "image/webp"],
    ])("reconoce %s por su firma", (_nombre, contenido, tipo) => {
      expect(detectarTipoArchivo(contenido)).toBe(tipo)
    })

    // Derived from R7.3
    it.each([
      ["un ZIP", bytes("PK", [3, 4], "...")],
      ["un ejecutable", bytes("MZ", [0x90, 0])],
      ["texto con extensión .pdf", bytes("hola, soy un PDF")],
      ["un RIFF que no es WebP", bytes("RIFF", [0, 0, 0, 0], "WAVE")],
      ["un archivo vacío", Buffer.alloc(0)],
      ["un PDF sin guion en la firma", bytes("%PDF1.7")],
    ])("rechaza %s", (_caso, contenido) => {
      expect(detectarTipoArchivo(contenido)).toBeNull()
    })
  })
})
