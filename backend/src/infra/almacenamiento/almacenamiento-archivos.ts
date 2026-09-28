export interface ArchivoAGuardar {
  clave: string
  contenido: Buffer
  tipoMime: string
}

export interface OpcionesUrlFirmada {
  /** Nombre con el que el navegador muestra o descarga el archivo. */
  nombreArchivo: string
  tipoMime: string
}

/**
 * Puerto de almacenamiento de archivos (stack/architecture.md). El adaptador
 * vive en infra/; el dominio y los tests dependen solo de esta interfaz.
 * No hay operación de borrado: los documentos legales no se eliminan (R7.8).
 */
export abstract class AlmacenamientoArchivos {
  /** Guarda una versión nueva bajo la clave; las anteriores se conservan (R7.4). */
  abstract guardar(archivo: ArchivoAGuardar): Promise<{ version: string }>

  /** URL de corta duración para leer una versión concreta (R7.7). */
  abstract urlFirmada(
    clave: string,
    version: string,
    opciones: OpcionesUrlFirmada,
  ): Promise<string>
}
