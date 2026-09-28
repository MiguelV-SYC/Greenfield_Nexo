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
import {
  type ArchivosDocumentos,
  documentosFaltantes,
  nombresDe,
  type TipoDocumentoLegal,
} from "@/components/organizaciones/documentos/documentos"
import { ErrorApi } from "@/lib/api/cliente"
import { cn } from "@/lib/utils"
import {
  aCuerpo,
  CAMPOS_PASO_1,
  CAMPOS_PASO_2,
  esquemaRegistro,
  type FormularioRegistro,
  pasoDelCampo,
  valoresIniciales,
} from "./formulario"
import { PasoDocumentos } from "./PasoDocumentos"
import { PasoIdentificacion } from "./PasoIdentificacion"
import { PasoSedes } from "./PasoSedes"
import {
  type Opcion,
  type Organizacion,
  type ServiciosAsistente,
  serviciosApi,
} from "./servicios"

type Paso = 1 | 2 | 3
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

/** R7.3, R7.5, R7.9: errores de documentos, que se muestran en el paso 3. */
function mensajeDocumentos(error: unknown): string | null {
  if (!(error instanceof ErrorApi)) return null
  if (error.estado === 422 && error.detalle.faltantes) {
    return `Faltan documentos obligatorios: ${nombresDe(error.detalle.faltantes)}`
  }
  if (error.estado === 413 || error.estado === 415) {
    return error.detalle.mensaje ?? "Uno de los archivos no se pudo cargar."
  }
  return null
}

/** Pasa los errores del servidor a sus campos; devuelve el paso a mostrar (R1.6, R1.7). */
function aplicarErrorServidor(form: Formulario, error: unknown): Paso | null {
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

function useDocumentos() {
  const [archivos, setArchivos] = useState<ArchivosDocumentos>({})
  const [errores, setErrores] = useState<
    Partial<Record<TipoDocumentoLegal, string>>
  >({})
  function cambiar(
    tipo: TipoDocumentoLegal,
    archivo: File,
    error: string | null,
  ) {
    setErrores((actuales) => ({ ...actuales, [tipo]: error ?? undefined }))
    if (!error) setArchivos((actuales) => ({ ...actuales, [tipo]: archivo }))
  }
  function reiniciar() {
    setArchivos({})
    setErrores({})
  }
  return { archivos, errores, cambiar, reiniciar }
}

/** Asistente "Registrar nueva organización" del mockup V5, pasos 1–3 (P1, P2). */
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
  const [paso, setPaso] = useState<Paso>(1)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const { catalogos, reintentar } = useCatalogos(servicios, abierto)
  const documentos = useDocumentos()

  async function siguiente() {
    const campos = paso === 1 ? [...CAMPOS_PASO_1] : [...CAMPOS_PASO_2]
    if (await form.trigger(campos)) setPaso(paso === 1 ? 2 : 3)
  }

  const registrar = form.handleSubmit(async (valores) => {
    setErrorGeneral(null)
    const faltantes = documentosFaltantes(
      Object.keys(documentos.archivos) as TipoDocumentoLegal[],
    )
    if (faltantes.length > 0) {
      setErrorGeneral(`Faltan documentos obligatorios: ${nombresDe(faltantes)}`)
      return
    }
    try {
      onRegistrada(
        await servicios.registrar(aCuerpo(valores), documentos.archivos),
      )
      form.reset(valoresIniciales())
      documentos.reiniciar()
      setPaso(1)
    } catch (error) {
      const deDocumentos = mensajeDocumentos(error)
      const pasoConError = deDocumentos ? 3 : aplicarErrorServidor(form, error)
      if (pasoConError) setPaso(pasoConError)
      setErrorGeneral(
        deDocumentos ??
          (pasoConError
            ? null
            : "No pudimos registrar la organización. Intenta de nuevo."),
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
              <p className="sr-only">{`Paso ${paso} de 3`}</p>
              <div className="wizard-steps" aria-hidden>
                {([1, 2, 3] as const).map((n) => (
                  <div
                    key={n}
                    className={cn(
                      "wizard-step-dot",
                      n === paso && "active",
                      n < paso && "done",
                    )}
                  />
                ))}
              </div>
              {paso === 1 && <PasoIdentificacion arl={catalogos.arl} />}
              {paso === 2 && (
                <PasoSedes
                  departamentos={catalogos.departamentos}
                  servicios={servicios}
                />
              )}
              {paso === 3 && (
                <PasoDocumentos
                  archivos={documentos.archivos}
                  errores={documentos.errores}
                  onCambiar={documentos.cambiar}
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
                  onClick={() => setPaso(paso === 3 ? 2 : 1)}
                >
                  ‹ Atrás
                </button>
                {paso < 3 ? (
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
