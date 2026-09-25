import { useFormContext } from "react-hook-form"

import { Campo } from "./Campo"
import type { FormularioRegistro } from "./formulario"
import type { Opcion } from "./servicios"

/** Paso 1: identificación legal (R1.1–R1.9), como en el mockup V5. */
export function PasoIdentificacion({ arl }: { arl: Opcion[] }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormularioRegistro>()
  const error = (campo: keyof FormularioRegistro) =>
    errors[campo]?.message as string | undefined

  return (
    <div>
      <div className="ficha-section-title" style={{ marginTop: 0 }}>
        Identificación de la organización
      </div>
      <div className="form-row flex gap-3">
        <Campo
          id="ow-razon-social"
          etiqueta="Razón social *"
          error={error("razonSocial")}
          className="flex-[2]"
        >
          <input
            id="ow-razon-social"
            className="form-input"
            placeholder="Ej. Sistemas y Computadores S.A."
            {...register("razonSocial")}
          />
        </Campo>
        <Campo
          id="ow-nombre-comercial"
          etiqueta="Nombre comercial"
          className="flex-1"
        >
          <input
            id="ow-nombre-comercial"
            className="form-input"
            placeholder="Ej. SYC"
            {...register("nombreComercial")}
          />
        </Campo>
      </div>
      <div className="form-row flex gap-3">
        <Campo
          id="ow-tipo-persona"
          etiqueta="Tipo de persona"
          className="flex-1"
        >
          <select
            id="ow-tipo-persona"
            className="form-select"
            {...register("tipoPersona")}
          >
            <option value="JURIDICA">Jurídica</option>
            <option value="NATURAL">Natural</option>
          </select>
        </Campo>
        <Campo
          id="ow-nit"
          etiqueta="NIT *"
          error={error("nit")}
          className="flex-[2]"
        >
          <input
            id="ow-nit"
            className="form-input"
            inputMode="numeric"
            placeholder="Ej. 890206391"
            {...register("nit")}
          />
        </Campo>
        <Campo
          id="ow-nit-dv"
          etiqueta="Dígito verif. *"
          error={error("digitoVerificacion")}
          className="flex-1"
        >
          <input
            id="ow-nit-dv"
            className="form-input"
            inputMode="numeric"
            maxLength={1}
            placeholder="Ej. 1"
            {...register("digitoVerificacion")}
          />
        </Campo>
      </div>

      <div className="ficha-section-title">Representante legal</div>
      <Campo
        id="ow-rep-legal"
        etiqueta="Nombre completo *"
        error={error("repLegalNombre")}
      >
        <input
          id="ow-rep-legal"
          className="form-input"
          placeholder="Nombre del representante legal"
          {...register("repLegalNombre")}
        />
      </Campo>
      <div className="form-row flex gap-3">
        <Campo id="ow-rep-tipo-doc" etiqueta="Tipo doc." className="flex-1">
          <select
            id="ow-rep-tipo-doc"
            className="form-select"
            {...register("repLegalTipoDoc")}
          >
            <option value="">Seleccione...</option>
            <option value="CC">CC</option>
            <option value="CE">CE</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </Campo>
        <Campo id="ow-rep-doc" etiqueta="Número" className="flex-[2]">
          <input
            id="ow-rep-doc"
            className="form-input"
            placeholder="N.° documento"
            {...register("repLegalNumeroDoc")}
          />
        </Campo>
      </div>

      <div className="ficha-section-title">Afiliación</div>
      <Campo
        id="ow-arl"
        etiqueta="ARL principal contratada por la empresa"
        error={error("arlCodigo")}
      >
        <select id="ow-arl" className="form-select" {...register("arlCodigo")}>
          <option value="">Seleccione...</option>
          {arl.map((a) => (
            <option key={a.codigo} value={a.codigo}>
              {a.nombre}
            </option>
          ))}
        </select>
      </Campo>
    </div>
  )
}
