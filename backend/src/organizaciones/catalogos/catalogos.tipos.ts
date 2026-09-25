/** Forma de los archivos de backend/prisma/catalogos/*.json (DEC-7). */
interface MetadatosCatalogo {
  catalogo: string
  version: string
  fechaCorte: string
  fuente: string
}

export interface CatalogoDivipola extends MetadatosCatalogo {
  departamentos: { codigo: string; nombre: string }[]
  municipios: { codigo: string; nombre: string; departamentoCodigo: string }[]
}

export interface CatalogoCiiu extends MetadatosCatalogo {
  actividades: { codigo: string; descripcion: string }[]
}

export interface CatalogoArl extends MetadatosCatalogo {
  arl: { codigo: string; nombre: string }[]
}

export interface Catalogos {
  divipola: CatalogoDivipola
  ciiu: CatalogoCiiu
  arl: CatalogoArl
}
