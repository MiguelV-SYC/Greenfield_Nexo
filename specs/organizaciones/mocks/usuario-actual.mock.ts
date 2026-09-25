// Mock de D1 (usuario autenticado y rol) — specs/organizaciones/requirements.md.
// Documenta las identidades de prueba. El backend NO importa este archivo:
// con AUTH_MODO=mock construye el usuario a partir de la cabecera
// `x-usuario-mock` (design.md, DEC-11).
//
// Ready to unmock: specs/auth/ aprobada en G2 y su endpoint de sesión
// desplegado en `pruebas`. Entonces AutenticacionGuard se reemplaza por el
// guard de auth y esta cabecera deja de existir.

/** Valor de la cabecera `x-usuario-mock`: `<usuarioId>` o `<usuarioId>;admin`. */
export const USUARIOS_DE_PRUEBA = {
  liderSstA: "lider-a",
  liderSstB: "lider-b",
  administrador: "admin-1;admin",
} as const
