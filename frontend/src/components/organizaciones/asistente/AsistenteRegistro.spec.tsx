import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ErrorApi } from "@/lib/api/cliente"
import { AsistenteRegistro } from "./AsistenteRegistro"
import type { Organizacion, ServiciosAsistente } from "./servicios"

function servicios(
  sobrescribir: Partial<ServiciosAsistente> = {},
): ServiciosAsistente {
  return {
    departamentos: jest.fn(async () => [
      { codigo: "68", nombre: "SANTANDER" },
      { codigo: "05", nombre: "ANTIOQUIA" },
    ]),
    municipios: jest.fn(async (codigo: string) =>
      codigo === "68"
        ? [{ codigo: "68001", nombre: "BUCARAMANGA" }]
        : [{ codigo: "05001", nombre: "MEDELLÍN" }],
    ),
    arl: jest.fn(async () => [{ codigo: "aurora", nombre: "Aurora" }]),
    buscarCiiu: jest.fn(async () => [
      { codigo: "6201", descripcion: "Desarrollo de sistemas informáticos" },
    ]),
    calcularEstandares: jest.fn(async () => ({
      estandares: 21 as const,
      riesgoMaximo: "II" as const,
      totalTrabajadores: 12,
      regla: "Entre 11 y 50 trabajadores con riesgo máximo I, II o III",
    })),
    registrar: jest.fn(async () => ({ id: "nueva" }) as Organizacion),
    ...sobrescribir,
  }
}

const usuario = () => userEvent.setup()

async function abrir(s = servicios(), onRegistrada = jest.fn()) {
  render(
    <AsistenteRegistro
      abierto
      onCerrar={jest.fn()}
      onRegistrada={onRegistrada}
      servicios={s}
    />,
  )
  await screen.findByLabelText(/razón social/i)
  return { s, onRegistrada }
}

async function llenarPaso1(u = usuario()) {
  await u.type(screen.getByLabelText(/razón social/i), "Dirección de Impuestos")
  await u.type(screen.getByLabelText(/^nit/i), "800197268")
  await u.type(screen.getByLabelText(/dígito/i), "4")
  await u.type(screen.getByLabelText(/nombre completo/i), "Representante")
  await u.click(screen.getByRole("button", { name: /siguiente/i }))
  await screen.findByText(/centro de trabajo #1/i)
}

async function llenarSede(u = usuario(), i = 0) {
  const sede = screen.getByRole("group", {
    name: `Centro de Trabajo #${i + 1}`,
  })
  const en = within(sede)
  await u.type(en.getByLabelText(/nombre del centro/i), "Oficina principal")
  await u.type(en.getByLabelText(/dirección/i), "Calle 36")
  await u.selectOptions(en.getByLabelText(/departamento/i), "68")
  await waitFor(() => expect(en.getByLabelText(/municipio/i)).toBeEnabled())
  await u.selectOptions(en.getByLabelText(/municipio/i), "68001")
  await u.clear(en.getByLabelText(/trabajadores/i))
  await u.type(en.getByLabelText(/trabajadores/i), "12")
  await u.type(en.getByLabelText(/actividad económica/i), "6201")
  await u.click(await en.findByRole("option", { name: /6201/ }))
}

describe("AsistenteRegistro", () => {
  // Derived from R5.10
  it("muestra un indicador mientras carga los catálogos", () => {
    const s = servicios({ departamentos: () => new Promise(() => undefined) })
    render(
      <AsistenteRegistro
        abierto
        onCerrar={jest.fn()}
        onRegistrada={jest.fn()}
        servicios={s}
      />,
    )
    expect(screen.getByRole("status")).toHaveTextContent(/cargando/i)
  })

  // Derived from R5.11
  it("muestra el error de catálogos y permite reintentar", async () => {
    const departamentos = jest
      .fn()
      .mockRejectedValueOnce(new Error("sin red"))
      .mockResolvedValue([{ codigo: "68", nombre: "SANTANDER" }])
    render(
      <AsistenteRegistro
        abierto
        onCerrar={jest.fn()}
        onRegistrada={jest.fn()}
        servicios={servicios({ departamentos })}
      />,
    )
    await screen.findByRole("alert")
    await usuario().click(screen.getByRole("button", { name: /reintentar/i }))
    expect(await screen.findByLabelText(/razón social/i)).toBeInTheDocument()
  })

  // Derived from R1.3
  it("empieza con tipo de persona Jurídica", async () => {
    await abrir()
    expect(screen.getByLabelText(/tipo de persona/i)).toHaveValue("JURIDICA")
  })

  // Derived from R1.1 y R1.4
  it("no avanza sin razón social, NIT, DV y representante legal", async () => {
    await abrir()
    await usuario().click(screen.getByRole("button", { name: /siguiente/i }))
    expect(
      await screen.findByText(/razón social es obligatoria/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/representante legal es obligatorio/i),
    ).toBeInTheDocument()
    expect(screen.queryByText(/centro de trabajo #1/i)).not.toBeInTheDocument()
  })

  // Derived from R1.5
  it("avisa si el NIT tiene caracteres distintos de dígitos", async () => {
    await abrir()
    const u = usuario()
    await u.type(screen.getByLabelText(/^nit/i), "800-197268")
    await u.click(screen.getByRole("button", { name: /siguiente/i }))
    expect(await screen.findByText(/solo dígitos/i)).toBeInTheDocument()
  })

  // Derived from R2.8
  it("no permite quitar la única sede", async () => {
    await abrir()
    const u = usuario()
    await llenarPaso1(u)
    expect(
      screen.queryByRole("button", { name: /quitar/i }),
    ).not.toBeInTheDocument()
    await u.click(
      screen.getByRole("button", { name: /añadir centro de trabajo/i }),
    )
    expect(screen.getAllByRole("button", { name: /quitar/i })).toHaveLength(2)
  })

  // Derived from R2.5 y R2.6
  it("habilita el municipio al elegir departamento y lista solo los suyos", async () => {
    const { s } = await abrir()
    const u = usuario()
    await llenarPaso1(u)
    expect(screen.getByLabelText(/municipio/i)).toBeDisabled()
    await u.selectOptions(screen.getByLabelText(/departamento/i), "68")
    await waitFor(() => expect(s.municipios).toHaveBeenCalledWith("68"))
    expect(
      await screen.findByRole("option", { name: "BUCARAMANGA" }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: "MEDELLÍN" }),
    ).not.toBeInTheDocument()
  })

  // Derived from R3.6
  it("muestra los estándares aplicables mientras se diligencian las sedes", async () => {
    const { s } = await abrir()
    await llenarPaso1()
    expect(
      await screen.findByText(/21 estándares mínimos aplicables/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/entre 11 y 50 trabajadores/i)).toBeInTheDocument()
    expect(s.calcularEstandares).toHaveBeenCalledWith([
      { claseRiesgo: "III", trabajadores: 1 },
    ])
  })

  // Derived from R2.2 y R2.7
  it("no registra con una sede incompleta", async () => {
    const { s } = await abrir()
    const u = usuario()
    await llenarPaso1(u)
    await u.click(
      screen.getByRole("button", { name: /registrar organización/i }),
    )
    expect(
      await screen.findByText(/escribe el nombre de la sede/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/elige una actividad del catálogo ciiu/i),
    ).toBeInTheDocument()
    expect(s.registrar).not.toHaveBeenCalled()
  })

  // Derived from R4.1 y R1.2
  it("registra con los datos del formulario y sin opcionales vacíos", async () => {
    const { s, onRegistrada } = await abrir()
    const u = usuario()
    await llenarPaso1(u)
    await llenarSede(u)
    await u.click(
      screen.getByRole("button", { name: /registrar organización/i }),
    )
    await waitFor(() => expect(onRegistrada).toHaveBeenCalled())
    expect(s.registrar).toHaveBeenCalledWith({
      razonSocial: "Dirección de Impuestos",
      tipoPersona: "JURIDICA",
      nit: "800197268",
      digitoVerificacion: "4",
      repLegalNombre: "Representante",
      sedes: [
        {
          nombre: "Oficina principal",
          direccion: "Calle 36",
          departamentoCodigo: "68",
          municipioCodigo: "68001",
          claseRiesgo: "III",
          trabajadores: 12,
          ciiuCodigo: "6201",
        },
      ],
    })
  })

  // Derived from R1.6
  it("vuelve al paso 1 si el servidor rechaza el dígito de verificación", async () => {
    const registrar = jest.fn(async () => {
      throw new ErrorApi(400, [
        {
          campo: "digitoVerificacion",
          mensajes: ["El dígito de verificación no corresponde al NIT"],
        },
      ])
    })
    await abrir(servicios({ registrar }))
    const u = usuario()
    await llenarPaso1(u)
    await llenarSede(u)
    await u.click(
      screen.getByRole("button", { name: /registrar organización/i }),
    )
    expect(
      await screen.findByText(/no corresponde al nit/i),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/razón social/i)).toBeVisible()
  })

  // Derived from R1.7
  it("avisa en el NIT cuando ya está registrado", async () => {
    const registrar = jest.fn(async () => {
      throw new ErrorApi(409)
    })
    await abrir(servicios({ registrar }))
    const u = usuario()
    await llenarPaso1(u)
    await llenarSede(u)
    await u.click(
      screen.getByRole("button", { name: /registrar organización/i }),
    )
    expect(
      await screen.findByText(/el nit ya está registrado/i),
    ).toBeInTheDocument()
  })

  it("muestra un error general si el registro falla por otra causa", async () => {
    const registrar = jest.fn(async () => {
      throw new Error("sin red")
    })
    await abrir(servicios({ registrar }))
    const u = usuario()
    await llenarPaso1(u)
    await llenarSede(u)
    await u.click(
      screen.getByRole("button", { name: /registrar organización/i }),
    )
    expect(await screen.findByText(/no pudimos registrar/i)).toBeInTheDocument()
  })
})
