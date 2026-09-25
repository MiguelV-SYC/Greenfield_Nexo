import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { ListaOrganizaciones, Tarjeta } from "@/lib/api/cliente"
import { MisOrganizaciones } from "./MisOrganizaciones"

function tarjeta(sobrescribir: Partial<Tarjeta> = {}): Tarjeta {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    nombreVisible: "DIAN",
    estado: "APROBADA",
    riesgoMaximo: "II",
    arl: { codigo: "aurora", nombre: "Aurora" },
    totalTrabajadores: 12,
    estandaresAplicables: 21,
    porcentajeImplementacion: null,
    porcentajeCumplimiento: null,
    puedeIngresar: true,
    motivoDevolucion: null,
    ...sobrescribir,
  }
}

const lista = (...organizaciones: Tarjeta[]): ListaOrganizaciones => ({
  total: organizaciones.length,
  organizaciones,
})

describe("MisOrganizaciones", () => {
  // Derived from R5.10
  it("muestra un indicador mientras carga", () => {
    render(<MisOrganizaciones cargar={() => new Promise(() => undefined)} />)
    expect(screen.getByRole("status")).toHaveTextContent(/cargando/i)
  })

  // Derived from R5.11
  it("muestra el error y permite reintentar", async () => {
    const cargar = jest
      .fn<Promise<ListaOrganizaciones>, []>()
      .mockRejectedValueOnce(new Error("sin red"))
      .mockResolvedValueOnce(lista(tarjeta()))
    render(<MisOrganizaciones cargar={cargar} />)
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /no pudimos cargar/i,
    )
    await userEvent.click(screen.getByRole("button", { name: /reintentar/i }))
    expect(await screen.findByText("DIAN")).toBeInTheDocument()
    expect(cargar).toHaveBeenCalledTimes(2)
  })

  // Derived from R5.6
  it("muestra el estado vacío con la acción de agregar", async () => {
    const onAgregar = jest.fn()
    render(
      <MisOrganizaciones cargar={async () => lista()} onAgregar={onAgregar} />,
    )
    expect(
      await screen.findByText(/aún no tienes organizaciones/i),
    ).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole("button", { name: /agregar organización/i }),
    )
    expect(onAgregar).toHaveBeenCalled()
  })

  // Derived from R5.7
  it("muestra el número de organizaciones", async () => {
    render(
      <MisOrganizaciones
        cargar={async () =>
          lista(tarjeta(), tarjeta({ id: "2", nombreVisible: "Ecopetrol" }))
        }
      />,
    )
    expect(await screen.findByText(/2 organizaciones/i)).toBeInTheDocument()
  })

  // Derived from R5.2 y R5.3
  it("muestra estado, riesgo, ARL, trabajadores y porcentajes sin evaluar", async () => {
    render(<MisOrganizaciones cargar={async () => lista(tarjeta())} />)
    const card = await screen.findByRole("article", { name: "DIAN" })
    expect(card).toHaveTextContent("Aprobada")
    expect(card).toHaveTextContent("II")
    expect(card).toHaveTextContent("Aurora")
    expect(card).toHaveTextContent("12")
    expect(card).toHaveTextContent(/sin evaluar/i)
  })

  // Derived from R5.4
  it("ofrece Ingresar solo en organizaciones aprobadas", async () => {
    render(
      <MisOrganizaciones
        cargar={async () =>
          lista(
            tarjeta(),
            tarjeta({
              id: "2",
              nombreVisible: "Ecopetrol",
              estado: "EN_VALIDACION",
              puedeIngresar: false,
            }),
          )
        }
      />,
    )
    const aprobada = await screen.findByRole("article", { name: "DIAN" })
    const enValidacion = screen.getByRole("article", { name: "Ecopetrol" })
    expect(aprobada.querySelector("a[href='/sgsst']")).not.toBeNull()
    expect(enValidacion.querySelector("a")).toBeNull()
    expect(enValidacion).toHaveTextContent("En validación")
  })

  // Derived from R5.5
  it("muestra el motivo de una organización devuelta", async () => {
    render(
      <MisOrganizaciones
        cargar={async () =>
          lista(
            tarjeta({
              estado: "DEVUELTA",
              puedeIngresar: false,
              motivoDevolucion: "Falta el RUT actualizado",
            }),
          )
        }
      />,
    )
    const card = await screen.findByRole("article", { name: "DIAN" })
    expect(card).toHaveTextContent("Devuelta")
    expect(card).toHaveTextContent("Falta el RUT actualizado")
  })

  it("vuelve a cargar al remontarse con otra key", async () => {
    const cargar = jest.fn(async () => lista(tarjeta()))
    const { rerender } = render(<MisOrganizaciones key="1" cargar={cargar} />)
    await screen.findByText("DIAN")
    rerender(<MisOrganizaciones key="2" cargar={cargar} />)
    await waitFor(() => expect(cargar).toHaveBeenCalledTimes(2))
  })
})
