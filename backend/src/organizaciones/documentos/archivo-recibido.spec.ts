import {
  BadRequestException,
  UnsupportedMediaTypeException,
} from "@nestjs/common"

import { ArchivoDocumentoPipe, nombreSeguro } from "./archivo-recibido"

describe("archivo recibido", () => {
  describe("nombreSeguro", () => {
    it.each([
      ["rut.pdf", "rut.pdf"],
      ["C:\\Users\\ana\\RUT 2026.pdf", "RUT 2026.pdf"],
      ["../../etc/passwd", "passwd"],
      ["  cédula\u0000\u001f.png  ", "cédula.png"],
      ["", "documento"],
      ["carpeta/", "documento"],
    ])("%j → %j", (original, esperado) => {
      expect(nombreSeguro(original)).toBe(esperado)
    })

    it("recorta a 200 caracteres", () => {
      expect(nombreSeguro(`${"a".repeat(300)}.pdf`)).toHaveLength(200)
    })
  })

  describe("ArchivoDocumentoPipe", () => {
    const pipe = new ArchivoDocumentoPipe()

    it("exige el archivo", () => {
      expect(() => pipe.transform(undefined)).toThrow(BadRequestException)
    })

    // Derived from R7.2
    it("toma el tipo del contenido, no del nombre", () => {
      const contenido = Buffer.from("%PDF-1.4 ficticio")
      expect(
        pipe.transform({
          originalname: "foto.jpg",
          size: 17,
          buffer: contenido,
        }),
      ).toEqual({
        contenido,
        nombreArchivo: "foto.jpg",
        tipoMime: "application/pdf",
        tamanoBytes: 17,
      })
    })

    // Derived from R7.3
    it("rechaza con 415 lo que no es PDF ni imagen", () => {
      const archivo = {
        originalname: "rut.pdf",
        size: 4,
        buffer: Buffer.from("PK\u0003\u0004"),
      }
      expect(() => pipe.transform(archivo)).toThrow(
        UnsupportedMediaTypeException,
      )
    })
  })
})
