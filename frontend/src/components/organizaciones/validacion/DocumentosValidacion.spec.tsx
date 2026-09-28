import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { DocumentosValidacion } from "./DocumentosValidacion"
import type {
  DocumentoLegal,
  ListaDocumentos,
  ServiciosValidacion,
} from "./servicios"

function documento(
  tipo: DocumentoLegal["tipo"],
  nombre: string,
  vigente: Partial<NonNullable<DocumentoLegal["vigente"]>> | null,
  obligatorio = true,
): DocumentoLegal {
  return {
    tipo,
    nombre,
    obligatorio,
    vigente: vigente && {
      version: 1,
      nombreArchivo: `${tipo}.pdf`,
      tipoMime: "application/pdf",
      tamanoBytes: 325_632,
      cargadoEn: "2026-09-20T15:00:00.000Z",
      ...vigente,
    },
  }
}

const lista: ListaDocumentos = {
  documentos: [
    documento("RUT", "RUT actualizado", { version: 2 }),
    documento("CEDULA_REP_LEGAL", "Cédula del representante legal", {
      tipoMime: "image/png",
      nombreArchivo: "cedula.png",
    }),
    documento("FORMULARIO_ARL", "Formulario de afiliación a ARL", null),
    documento(
      "NO_AFILIACION_ARL",
      "Certificado de no afiliación a otra ARL",
      null,
      false,
    ),
  ],
  faltantes: ["FORMULARIO_ARL"],
}

function servicios(
  sobrescribir: Partial<ServiciosValidacion> = {},
): ServiciosValidacion {
  return {
    cola: jest.fn(),
    detalle: jest.fn(),
    aprobar: jest.fn(),
    devolver: jest.fn(),
    documentos: jest.fn(async () => lista),
    urlDocumento: jest.fn(async () => ({
      url: "http://minio.local/firmada",
      expiraEn: "2026-09-28T15:05:00.000Z",
    })),
    ...sobrescribir,
  }
}

describe("DocumentosValidacion", () => {
  // Derived from R5.10
  it("muestra un indicador mientras carga", () => {
    render(
      <DocumentosValidacion
        id="a"
        servicios={servicios({
          documentos: () => new Promise(() => undefined),
        })}
      />,
    )
    expect(screen.getByRole("status")).toHaveTextContent(/cargando/i)
  })

  // Derived from R5.11
  it("muestra el error y permite reintentar", async () => {
    const documentos = jest
      .fn()
      .mockRejectedValueOnce(new Error("sin red"))
      .mockResolvedValue(lista)
    render(
      <DocumentosValidacion id="a" servicios={servicios({ documentos })} />,
    )
    await userEvent
      .setup()
      .click(await screen.findByRole("button", { name: /reintentar/i }))
    expect(await screen.findByText("RUT actualizado")).toBeInTheDocument()
  })

  // Derived from R7.6, R7.1
  it("lista cada documento con su versión vigente o lo que falta", async () => {
    render(<DocumentosValidacion id="a" servicios={servicios()} />)
    const filas = within(
      await screen.findByRole("list", { name: /documentos legales/i }),
    ).getAllByRole("listitem")
    expect(filas[0]).toHaveTextContent("RUT actualizado")
    expect(filas[0]).toHaveTextContent("318 KB · RUT.pdf · versión 2")
    expect(filas[0]).toHaveTextContent("Cargado")
    expect(filas[2]).toHaveTextContent("Falta")
    expect(filas[3]).toHaveTextContent("Opcional")
    expect(
      screen.queryByRole("button", { name: /ver formulario/i }),
    ).not.toBeInTheDocument()
  })

  // Derived from R7.6, R7.7
  it("abre un PDF con su URL firmada", async () => {
    const s = servicios()
    render(<DocumentosValidacion id="a" servicios={s} />)
    await userEvent
      .setup()
      .click(await screen.findByRole("button", { name: /ver rut/i }))
    expect(s.urlDocumento).toHaveBeenCalledWith("a", "RUT")
    const vista = await screen.findByTitle("RUT actualizado: RUT.pdf")
    expect(vista).toHaveAttribute("src", "http://minio.local/firmada")
  })

  it("muestra las imágenes como imagen", async () => {
    render(<DocumentosValidacion id="a" servicios={servicios()} />)
    await userEvent
      .setup()
      .click(await screen.findByRole("button", { name: /ver cédula/i }))
    expect(
      await screen.findByRole("img", { name: /cédula del representante/i }),
    ).toHaveAttribute("src", "http://minio.local/firmada")
  })

  it("avisa si no se puede abrir el documento", async () => {
    const urlDocumento = jest.fn(async () => {
      throw new Error("404")
    })
    render(
      <DocumentosValidacion id="a" servicios={servicios({ urlDocumento })} />,
    )
    await userEvent
      .setup()
      .click(await screen.findByRole("button", { name: /ver rut/i }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /no pudimos abrir/i,
    )
  })
})
