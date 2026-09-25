import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ErrorApi } from "@/lib/api/cliente"
import { ColaValidacion } from "./ColaValidacion"
import type {
  Caso,
  DetalleOrganizacion,
  ServiciosValidacion,
} from "./servicios"

function caso(sobrescribir: Partial<Caso> = {}): Caso {
  return {
    id: "a",
    nombreVisible: "DIAN",
    razonSocial: "Dirección de Impuestos y Aduanas Nacionales",
    nit: "800197268",
    digitoVerificacion: "4",
    enviadaEn: "2026-09-20T15:00:00.000Z",
    riesgoMaximo: "II",
    totalTrabajadores: 12,
    estandaresAplicables: 21,
    sedes: 1,
    ...sobrescribir,
  }
}

const detalle = {
  id: "a",
  nombreVisible: "DIAN",
  razonSocial: "Dirección de Impuestos y Aduanas Nacionales",
  nit: "800197268",
  digitoVerificacion: "4",
  tipoPersona: "JURIDICA",
  repLegalNombre: "Representante",
  estandaresAplicables: 21,
  riesgoMaximo: "II",
  totalTrabajadores: 12,
  sedes: [
    {
      id: "s1",
      nombre: "Oficina principal",
      direccion: "Calle 36",
      departamentoCodigo: "68",
      municipioCodigo: "68001",
      claseRiesgo: "II",
      trabajadores: 12,
      ciiuCodigo: "6201",
    },
  ],
} as unknown as DetalleOrganizacion

function servicios(
  sobrescribir: Partial<ServiciosValidacion> = {},
): ServiciosValidacion {
  return {
    cola: jest.fn(async () => [
      caso(),
      caso({
        id: "b",
        nombreVisible: "Ecopetrol",
        nit: "899999068",
        digitoVerificacion: "1",
      }),
    ]),
    detalle: jest.fn(async () => detalle),
    aprobar: jest.fn(async () => undefined),
    devolver: jest.fn(async () => undefined),
    ...sobrescribir,
  }
}

const u = () => userEvent.setup()

describe("ColaValidacion", () => {
  // Derived from R5.10
  it("muestra un indicador mientras carga", () => {
    render(
      <ColaValidacion
        servicios={servicios({ cola: () => new Promise(() => undefined) })}
      />,
    )
    expect(screen.getByRole("status")).toHaveTextContent(/cargando/i)
  })

  // Derived from R5.11
  it("muestra el error y permite reintentar", async () => {
    const cola = jest
      .fn()
      .mockRejectedValueOnce(new Error("sin red"))
      .mockResolvedValue([caso()])
    render(<ColaValidacion servicios={servicios({ cola })} />)
    await u().click(await screen.findByRole("button", { name: /reintentar/i }))
    expect(await screen.findByText("DIAN")).toBeInTheDocument()
  })

  // Derived from R4.9
  it("explica que la cola es solo para el Administrador", async () => {
    const cola = jest.fn(async () => {
      throw new ErrorApi(403)
    })
    render(<ColaValidacion servicios={servicios({ cola })} />)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /solo el administrador/i,
    )
  })

  it("indica cuando no hay organizaciones pendientes", async () => {
    render(<ColaValidacion servicios={servicios({ cola: async () => [] })} />)
    expect(
      await screen.findByText(/no hay organizaciones en validación/i),
    ).toBeInTheDocument()
  })

  // Derived from R5.8
  it("lista la cola en el orden recibido con NIT y fecha de envío", async () => {
    render(<ColaValidacion servicios={servicios()} />)
    const filas = await screen.findAllByRole("row")
    expect(filas[1]).toHaveTextContent("DIAN")
    expect(filas[1]).toHaveTextContent("800197268-4")
    expect(filas[1]).toHaveTextContent("20/09/2026")
    expect(filas[2]).toHaveTextContent("Ecopetrol")
  })

  // Derived from R5.9
  it("muestra identificación legal, sedes y estándares al revisar", async () => {
    render(<ColaValidacion servicios={servicios()} />)
    await u().click(
      (await screen.findAllByRole("button", { name: /revisar/i }))[0],
    )
    const panel = await screen.findByRole("region", { name: /revisión/i })
    expect(panel).toHaveTextContent("Representante")
    expect(panel).toHaveTextContent("Oficina principal")
    expect(panel).toHaveTextContent(/21 estándares/i)
  })

  // Derived from R4.3
  it("aprueba y recarga la cola", async () => {
    const s = servicios()
    render(<ColaValidacion servicios={s} />)
    const usuario = u()
    await usuario.click(
      (await screen.findAllByRole("button", { name: /revisar/i }))[0],
    )
    await usuario.click(await screen.findByRole("button", { name: /aprobar/i }))
    await waitFor(() => expect(s.aprobar).toHaveBeenCalledWith("a"))
    await waitFor(() => expect(s.cola).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole("status")).toHaveTextContent(/aprobada/i)
  })

  // Derived from R4.4
  it("exige un motivo para devolver", async () => {
    const s = servicios()
    render(<ColaValidacion servicios={s} />)
    const usuario = u()
    await usuario.click(
      (await screen.findAllByRole("button", { name: /revisar/i }))[0],
    )
    await usuario.click(
      await screen.findByRole("button", { name: /^devolver$/i }),
    )
    const dialogo = await screen.findByRole("dialog", { name: /devolver/i })
    await usuario.type(within(dialogo).getByLabelText(/motivo/i), "   ")
    await usuario.click(
      within(dialogo).getByRole("button", { name: /confirmar devolución/i }),
    )
    expect(
      await within(dialogo).findByText(/escribe el motivo/i),
    ).toBeInTheDocument()
    expect(s.devolver).not.toHaveBeenCalled()
  })

  // Derived from R4.5
  it("devuelve con el motivo escrito", async () => {
    const s = servicios()
    render(<ColaValidacion servicios={s} />)
    const usuario = u()
    await usuario.click(
      (await screen.findAllByRole("button", { name: /revisar/i }))[0],
    )
    await usuario.click(
      await screen.findByRole("button", { name: /^devolver$/i }),
    )
    const dialogo = await screen.findByRole("dialog", { name: /devolver/i })
    await usuario.type(
      within(dialogo).getByLabelText(/motivo/i),
      "  Falta el RUT  ",
    )
    await usuario.click(
      within(dialogo).getByRole("button", { name: /confirmar devolución/i }),
    )
    await waitFor(() =>
      expect(s.devolver).toHaveBeenCalledWith("a", "Falta el RUT"),
    )
  })

  // Derived from R4.10
  it("avisa si la organización ya no estaba en validación", async () => {
    const aprobar = jest.fn(async () => {
      throw new ErrorApi(409)
    })
    render(<ColaValidacion servicios={servicios({ aprobar })} />)
    const usuario = u()
    await usuario.click(
      (await screen.findAllByRole("button", { name: /revisar/i }))[0],
    )
    await usuario.click(await screen.findByRole("button", { name: /aprobar/i }))
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /ya no está en validación/i,
    )
  })
})
