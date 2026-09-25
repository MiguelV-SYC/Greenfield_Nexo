import { Transform } from "class-transformer"

/** Recorta espacios para que un texto en blanco cuente como vacío (R1.1, R2.2, R4.4). */
export const Recortar = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
