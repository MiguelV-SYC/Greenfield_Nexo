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

const OBLIGATORIOS = [
  "RUT actualizado",
  "Certificado de Cámara de Comercio",
  "Cédula del representante legal",
  "Formulario de afiliación a ARL",
]

// D6 (Ley 1581): archivos ficticios.
const pdf = (nombre: string, tamano = 2048) =>
  new File([new Uint8Array(tamano)], nombre, { type: "application/pdf" })

async function irADocumentos(u = usuario()) {
  await u.click(screen.getByRole("button", { name: /siguiente/i }))
  await screen.findByText(/documentos legales requeridos/i)
}

async function cargarObligatorios(u = usuario()) {
  for (const nombre of OBLIGATORIOS) {
    await u.upload(
      screen.getByLabelText(`Cargar ${nombre}`),
      pdf(`${nombre}.pdf`),
    )
  }
}

async function registrarCompleto(u = usuario()) {
  await llenarPaso1(u)
  await llenarSede(u)
  await irADocumentos(u)
  await cargarObligatorios(u)
  await u.click(screen.getByRole("button", { name: /registrar organización/i }))
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
    await u.click(screen.getByRole("button", { name: /siguiente/i }))
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
    await registrarCompleto()
    await waitFor(() => expect(onRegistrada).toHaveBeenCalled())
    expect(s.registrar).toHaveBeenCalledWith(
      {
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
      },
      {
        RUT: expect.any(File),
        CAMARA_COMERCIO: expect.any(File),
        CEDULA_REP_LEGAL: expect.any(File),
        FORMULARIO_ARL: expect.any(File),
      },
    )
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
    await registrarCompleto()
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
    await registrarCompleto()
    expect(
      await screen.findByText(/el nit ya está registrado/i),
    ).toBeInTheDocument()
  })

  it("muestra un error general si el registro falla por otra causa", async () => {
    const registrar = jest.fn(async () => {
      throw new Error("sin red")
    })
    await abrir(servicios({ registrar }))
    await registrarCompleto()
    expect(await screen.findByText(/no pudimos registrar/i)).toBeInTheDocument()
  })
})

describe("AsistenteRegistro — paso 3, documentos legales", () => {
  async function enDocumentos() {
    const contexto = await abrir()
    const u = usuario()
    await llenarPaso1(u)
    await llenarSede(u)
    await irADocumentos(u)
    return { ...contexto, u }
  }

  // Derived from R7.1
  it("lista los cuatro obligatorios pendientes y el opcional", async () => {
    await enDocumentos()
    const filas = within(
      screen.getByRole("list", { name: /documentos legales/i }),
    ).getAllByRole("listitem")
    expect(filas).toHaveLength(5)
    expect(filas[0]).toHaveTextContent("RUT actualizado")
    expect(filas[0]).toHaveTextContent("Pendiente")
    expect(filas[4]).toHaveTextContent("Opcional")
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument()
  })

  // Derived from R7.5
  it("no registra sin los obligatorios e indica cuáles faltan", async () => {
    const { s, u } = await enDocumentos()
    await u.upload(
      screen.getByLabelText("Cargar RUT actualizado"),
      pdf("rut.pdf"),
    )
    await u.click(
      screen.getByRole("button", { name: /registrar organización/i }),
    )
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Faltan documentos obligatorios: Certificado de Cámara de Comercio, " +
        "Cédula del representante legal, Formulario de afiliación a ARL",
    )
    expect(s.registrar).not.toHaveBeenCalled()
  })

  // Derived from R7.2, R7.4
  it("muestra el archivo cargado y permite reemplazarlo", async () => {
    const { u } = await enDocumentos()
    await u.upload(
      screen.getByLabelText("Cargar RUT actualizado"),
      pdf("rut-viejo.pdf", 325_632),
    )
    expect(screen.getByText("318 KB · rut-viejo.pdf")).toBeInTheDocument()
    await u.upload(
      screen.getByLabelText("Reemplazar RUT actualizado"),
      pdf("rut-nuevo.pdf"),
    )
    expect(screen.getByText(/rut-nuevo\.pdf/)).toBeInTheDocument()
  })

  // Derived from R7.3
  it("rechaza en el navegador lo que no es PDF ni imagen", async () => {
    await enDocumentos()
    // El navegador permite elegir "Todos los archivos" aunque haya `accept`.
    const u = userEvent.setup({ applyAccept: false })
    const zip = new File(["PK"], "rut.zip", { type: "application/zip" })
    await u.upload(screen.getByLabelText("Cargar RUT actualizado"), zip)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /formatos aceptados: pdf, jpg, png o webp/i,
    )
    expect(screen.getByLabelText("Cargar RUT actualizado")).toBeInTheDocument()
  })

  // Derived from R7.9
  it("rechaza en el navegador un archivo de más de 10 MB", async () => {
    const { u } = await enDocumentos()
    await u.upload(
      screen.getByLabelText("Cargar RUT actualizado"),
      pdf("rut.pdf", 10 * 1024 * 1024 + 1),
    )
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /tamaño máximo permitido de 10 MB/,
    )
  })

  // Derived from R7.5
  it("muestra los faltantes que informa el servidor", async () => {
    const registrar = jest.fn(async () => {
      throw new ErrorApi(422, [], {
        mensaje: "Faltan documentos obligatorios",
        faltantes: ["RUT"],
      })
    })
    await abrir(servicios({ registrar }))
    await registrarCompleto()
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Faltan documentos obligatorios: RUT actualizado",
    )
    expect(screen.getByText("Paso 3 de 3")).toBeInTheDocument()
  })

  // Derived from R7.3, R7.9
  it("muestra el rechazo del servidor por tipo o tamaño", async () => {
    const registrar = jest.fn(async () => {
      throw new ErrorApi(415, [], {
        mensaje:
          "Formato no aceptado. Formatos aceptados: PDF, JPG, PNG o WebP",
      })
    })
    await abrir(servicios({ registrar }))
    await registrarCompleto()
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /formato no aceptado/i,
    )
  })

  it("vuelve a las sedes con Atrás", async () => {
    const { u } = await enDocumentos()
    await u.click(screen.getByRole("button", { name: /atrás/i }))
    expect(await screen.findByText(/centro de trabajo #1/i)).toBeInTheDocument()
  })
})
