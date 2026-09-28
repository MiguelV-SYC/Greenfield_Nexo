import AxeBuilder from "@axe-core/playwright"
import { expect, type Locator, type Page } from "@playwright/test"

// Utilidades compartidas por los E2E del módulo organizaciones.

export async function ingresarComo(page: Page, usuario: string) {
  await page.goto("/login")
  // La tarjeta de login del kit se despliega con "Inicie sesión". En modo
  // desarrollo el botón puede verse antes de que React hidrate: se reintenta.
  await expect(async () => {
    await page.getByRole("button", { name: /inicie sesión/i }).click()
    await expect(
      page.getByRole("button", { name: /ocultar inicio de sesión/i }),
    ).toBeVisible({ timeout: 1_000 })
  }).toPass({ timeout: 30_000 })
  await page.getByLabel("Usuario", { exact: true }).fill(usuario)
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("no-se-valida-en-el-mock")
  await page.getByRole("button", { name: /ingresar/i }).click()
}

/** NFR6: cero violaciones serious/critical de WCAG 2.1 AA según axe-core. */
export async function exigirAccesibilidad(page: Page, zona?: string) {
  let analisis = new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ])
  if (zona) analisis = analisis.include(zona)
  const { violations } = await analisis.analyze()
  const graves = violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  )
  expect(
    graves.map(
      (v) =>
        `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`,
    ),
  ).toEqual([])
}

export async function llenarSede(
  page: Page,
  indice: number,
  nombre: string,
  trabajadores: string,
) {
  const sede = page.getByRole("group", {
    name: `Centro de Trabajo #${indice + 1}`,
  })
  await sede.getByLabel(/nombre del centro/i).fill(nombre)
  await sede.getByLabel(/dirección/i).fill("Calle 36 # 27-52")
  await sede.getByLabel(/departamento/i).selectOption("68")
  await expect(sede.getByLabel(/municipio/i)).toBeEnabled()
  await sede.getByLabel(/municipio/i).selectOption("68001")
  await sede.getByLabel(/trabajadores/i).fill(trabajadores)
  await sede.getByLabel(/actividad económica/i).fill("6201")
  await sede.getByRole("option", { name: /6201/ }).click()
}

export const DOCUMENTOS_OBLIGATORIOS = [
  "RUT actualizado",
  "Certificado de Cámara de Comercio",
  "Cédula del representante legal",
  "Formulario de afiliación a ARL",
]

/** D6 (Ley 1581, BLOCK): PDF ficticio generado en la prueba, nunca uno real. */
export function pdfFicticio(nombre: string) {
  return {
    name: `${nombre}.pdf`,
    mimeType: "application/pdf",
    buffer: Buffer.from(`%PDF-1.7\n% documento ficticio: ${nombre}\n%%EOF`),
  }
}

/** Paso 3 del asistente: carga los documentos indicados. */
export async function cargarDocumentos(
  asistente: Locator,
  nombres: string[] = DOCUMENTOS_OBLIGATORIOS,
) {
  for (const nombre of nombres) {
    await asistente
      .getByLabel(`Cargar ${nombre}`)
      .setInputFiles(pdfFicticio(nombre))
    await expect(asistente.getByLabel(`Reemplazar ${nombre}`)).toBeAttached()
  }
}
