// El cliente generado de Prisma importa `./x.js` apuntando a `./x.ts`
// (nodenext). Se resuelve normal y, solo si falla, se prueba el `.ts`: así no
// se tocan los imports de las dependencias.
module.exports = (ruta, opciones) => {
  try {
    return opciones.defaultResolver(ruta, opciones)
  } catch (error) {
    if (/^\.{1,2}\/.*\.js$/.test(ruta)) {
      return opciones.defaultResolver(ruta.replace(/\.js$/, ".ts"), opciones)
    }
    throw error
  }
}
