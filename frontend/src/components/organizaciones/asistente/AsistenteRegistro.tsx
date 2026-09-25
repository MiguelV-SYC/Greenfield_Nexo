"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  FormProvider,
  type Path,
  useForm,
  type UseFormReturn,
} from "react-hook-form"
import type { z } from "zod"

import { Modal } from "@/components/app/Modal"
import { ErrorApi } from "@/lib/api/cliente"
import { cn } from "@/lib/utils"
import {
  aCuerpo,
  CAMPOS_PASO_1,
  esquemaRegistro,
  type FormularioRegistro,
  pasoDelCampo,
  valoresIniciales,
} from "./formulario"
import { PasoIdentificacion } from "./PasoIdentificacion"
import { PasoSedes } from "./PasoSedes"
import {
  type Opcion,
  type Organizacion,
  type ServiciosAsistente,
  serviciosApi,
} from "./servicios"

type Salida = z.output<typeof esquemaRegistro>
type Formulario = UseFormReturn<FormularioRegistro, unknown, Salida>
type Catalogos =
  | { estado: "cargando" }
  | { estado: "error" }
  | { estado: "listo"; departamentos: Opcion[]; arl: Opcion[] }

function useCatalogos(servicios: ServiciosAsistente, abierto: boolean) {
  const [catalogos, setCatalogos] = useState<Catalogos>({ estado: "cargando" })
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    if (!abierto) return
    let vigente = true
    Promise.all([servicios.departamentos(), servicios.arl()])
      .then(
        ([departamentos, arl]) =>
          vigente && setCatalogos({ estado: "listo", departamentos, arl }),
      )
      .catch(() => vigente && setCatalogos({ estado: "error" }))
    return () => {
      vigente = false
    }
  }, [servicios, abierto, intento])
  const reintentar = () => {
    setCatalogos({ estado: "cargando" })
    setIntento((n) => n + 1)
  }
  return { catalogos, reintentar }
}

/** Pasa los errores del servidor a sus campos; devuelve el paso a mostrar (R1.6, R1.7). */
function aplicarErrorServidor(form: Formulario, error: unknown): 1 | 2 | null {
  if (!(error instanceof ErrorApi)) return null
  if (error.estado === 409) {
    form.setError("nit", { message: "El NIT ya está registrado" })
    return 1
  }
  if (error.estado !== 400 || error.errores.length === 0) return null
  for (const { campo, mensajes } of error.errores) {
    form.setError(campo as Path<FormularioRegistro>, { message: mensajes[0] })
  }
  return pasoDelCampo(error.errores[0].campo)
}

export interface AsistenteRegistroProps {
  abierto: boolean
  onCerrar: () => void
  onRegistrada: (organizacion: Organizacion) => void
  servicios?: ServiciosAsistente
}

/** Asistente "Registrar nueva organización" del mockup V5, pasos 1–2 (P1). */
export function AsistenteRegistro({
  abierto,
  onCerrar,
  onRegistrada,
  servicios = serviciosApi,
}: AsistenteRegistroProps) {
  const form: Formulario = useForm<FormularioRegistro, unknown, Salida>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: valoresIniciales(),
  })
  const [paso, setPaso] = useState<1 | 2>(1)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const { catalogos, reintentar } = useCatalogos(servicios, abierto)

  async function siguiente() {
    if (await form.trigger([...CAMPOS_PASO_1])) setPaso(2)
  }

  const registrar = form.handleSubmit(async (valores) => {
    setErrorGeneral(null)
    try {
      onRegistrada(await servicios.registrar(aCuerpo(valores)))
      form.reset(valoresIniciales())
      setPaso(1)
    } catch (error) {
      const pasoConError = aplicarErrorServidor(form, error)
      if (pasoConError) setPaso(pasoConError)
      else
        setErrorGeneral(
          "No pudimos registrar la organización. Intenta de nuevo.",
        )
    }
  })

  return (
    <div className="nexo-app contents">
      <Modal
        open={abierto}
        onClose={onCerrar}
        title="Registrar nueva organización"
        subtitle="Datos e identificación legal según el SG-SST (Decreto 1072 de 2015) y afiliación a ARL"
      >
        {catalogos.estado === "cargando" && (
          <p role="status">Cargando catálogos…</p>
        )}
        {catalogos.estado === "error" && (
          <div role="alert" className="empty-state">
            <p>No pudimos cargar los catálogos.</p>
            <button type="button" className="btn" onClick={reintentar}>
              Reintentar
            </button>
          </div>
        )}
        {catalogos.estado === "listo" && (
          <FormProvider {...form}>
            <form onSubmit={registrar} noValidate>
              <p className="sr-only">{`Paso ${paso} de 2`}</p>
              <div className="wizard-steps" aria-hidden>
                <div
                  className={cn(
                    "wizard-step-dot",
                    paso === 1 ? "active" : "done",
                  )}
                />
                <div
                  className={cn("wizard-step-dot", paso === 2 && "active")}
                />
              </div>
              {paso === 1 ? (
                <PasoIdentificacion arl={catalogos.arl} />
              ) : (
                <PasoSedes
                  departamentos={catalogos.departamentos}
                  servicios={servicios}
                />
              )}
              {errorGeneral && (
                <p role="alert" className="mt-3 text-sm text-[#C62828]">
                  {errorGeneral}
                </p>
              )}
              <div className="wizard-nav">
                <button
                  type="button"
                  className="btn"
                  style={{ visibility: paso === 1 ? "hidden" : "visible" }}
                  onClick={() => setPaso(1)}
                >
                  ‹ Atrás
                </button>
                {paso === 1 ? (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={siguiente}
                  >
                    Siguiente ›
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn primary"
                    disabled={form.formState.isSubmitting}
                  >
                    Registrar organización
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        )}
      </Modal>
    </div>
  )
}
