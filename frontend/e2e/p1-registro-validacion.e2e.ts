import AxeBuilder from "@axe-core/playwright"
import { expect, type Page, test } from "@playwright/test"

// Prueba independiente de P1 (requirements.md): un Líder SST registra una
// organización con dos sedes, ve los estándares aplicables y la envía; el
// Administrador la aprueba; la organización queda habilitada para ingresar.
test.describe.configure({ mode: "serial" })

const LIDER = "lider-e2e"

async function ingresarComo(page: Page, usuario: string) {
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
async function exigirAccesibilidad(page: Page, zona?: string) {
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

async function llenarSede(
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

test("el Líder SST registra una organización con dos sedes (R5.6, R3.6, R4.1, R5.2, R5.4)", async ({
  page,
}) => {
  await ingresarComo(page, LIDER)
  await expect(page).toHaveURL(/\/organizaciones$/)
  await expect(page.getByText(/aún no tienes organizaciones/i)).toBeVisible()
  await exigirAccesibilidad(page)

  await page
    .getByRole("button", { name: /agregar organización/i })
    .first()
    .click()
  const asistente = page.getByRole("dialog", {
    name: /registrar nueva organización/i,
  })
  await asistente
    .getByLabel(/razón social/i)
    .fill("Dirección de Impuestos y Aduanas Nacionales")
  await asistente.getByLabel(/nombre comercial/i).fill("DIAN")
  await asistente.getByLabel(/^nit/i).fill("800197268")
  await asistente.getByLabel(/dígito/i).fill("4")
  await asistente.getByLabel(/nombre completo/i).fill("Representante E2E")
  await exigirAccesibilidad(page, '[role="dialog"]')
  await asistente.getByRole("button", { name: /siguiente/i }).click()

  await llenarSede(page, 0, "Oficina principal", "30")
  await asistente
    .getByRole("button", { name: /añadir centro de trabajo/i })
    .click()
  await llenarSede(page, 1, "Bodega", "25")
  // R3.1: 55 trabajadores en total → 62 estándares.
  await expect(
    asistente.getByText(/62 estándares mínimos aplicables/i),
  ).toBeVisible()
  await exigirAccesibilidad(page, '[role="dialog"]')
  await asistente
    .getByRole("button", { name: /registrar organización/i })
    .click()

  const tarjeta = page.getByRole("article", { name: "DIAN" })
  await expect(tarjeta).toContainText("En validación")
  await expect(tarjeta).toContainText("55")
  await expect(tarjeta).toContainText(/sin evaluar/i)
  await expect(tarjeta.getByRole("link", { name: /ingresar/i })).toHaveCount(0)
})

test("el Administrador aprueba la organización desde su cola (R5.8, R5.9, R4.3)", async ({
  page,
}) => {
  await ingresarComo(page, "admin")
  await expect(page).toHaveURL(/\/admin\/validacion$/)
  const fila = page.getByRole("row", { name: /DIAN/ })
  await expect(fila).toContainText("800197268-4")
  await exigirAccesibilidad(page)
  await fila.getByRole("button", { name: /revisar/i }).click()
  const revision = page.getByRole("region", { name: /revisión de dian/i })
  await expect(revision).toContainText("62 estándares mínimos aplicables")
  await expect(revision).toContainText("Bodega")
  await revision.getByRole("button", { name: /aprobar/i }).click()
  await expect(page.getByRole("status")).toContainText(/aprobada/i)
  await expect(
    page.getByText(/no hay organizaciones en validación/i),
  ).toBeVisible()
})

test("el Líder SST puede ingresar a la organización aprobada (R5.4)", async ({
  page,
}) => {
  await ingresarComo(page, LIDER)
  const tarjeta = page.getByRole("article", { name: "DIAN" })
  await expect(tarjeta).toContainText("Aprobada")
  await tarjeta.getByRole("link", { name: /ingresar/i }).click()
  await expect(page).toHaveURL(/\/sgsst$/)
})

test("si falla la carga de Mis organizaciones se puede reintentar (R5.11)", async ({
  page,
}) => {
  await ingresarComo(page, LIDER)
  await expect(page.getByRole("article", { name: "DIAN" })).toBeVisible()
  await page.route("**/api/v1/organizaciones", (ruta) => ruta.abort())
  await page.reload()
  // Next agrega su propio role="alert" (anunciador de rutas): se busca el mensaje.
  await expect(
    page.getByText(/no pudimos cargar tus organizaciones/i),
  ).toBeVisible()
  await page.unroute("**/api/v1/organizaciones")
  await page.getByRole("button", { name: /reintentar/i }).click()
  await expect(page.getByRole("article", { name: "DIAN" })).toBeVisible()
})
