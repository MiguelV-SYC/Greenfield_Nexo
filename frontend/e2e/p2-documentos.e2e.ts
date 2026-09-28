import { expect, test } from "@playwright/test"

import {
  cargarDocumentos,
  DOCUMENTOS_OBLIGATORIOS,
  exigirAccesibilidad,
  ingresarComo,
  llenarSede,
} from "./utilidades"

// Prueba independiente de P2 (requirements.md): el Líder SST carga los
// documentos obligatorios, el envío a validación exige los 4 obligatorios y
// el Administrador los consulta antes de aprobar. D6 (Ley 1581, BLOCK): solo
// documentos ficticios generados en la prueba.
test.describe.configure({ mode: "serial" })

const LIDER = "lider-e2e-p2"

test("el envío exige los 4 documentos obligatorios (R7.1, R7.2, R7.5)", async ({
  page,
}) => {
  await ingresarComo(page, LIDER)
  await expect(page).toHaveURL(/\/organizaciones$/)
  await page
    .getByRole("button", { name: /agregar organización/i })
    .first()
    .click()
  const asistente = page.getByRole("dialog", {
    name: /registrar nueva organización/i,
  })
  await asistente.getByLabel(/razón social/i).fill("Ecopetrol S.A.")
  await asistente.getByLabel(/nombre comercial/i).fill("Ecopetrol")
  await asistente.getByLabel(/^nit/i).fill("899999068")
  await asistente.getByLabel(/dígito/i).fill("1")
  await asistente.getByLabel(/nombre completo/i).fill("Representante P2")
  await asistente.getByRole("button", { name: /siguiente/i }).click()
  await llenarSede(page, 0, "Sede administrativa", "8")
  await asistente.getByRole("button", { name: /siguiente/i }).click()

  await expect(
    asistente.getByText(/documentos legales requeridos/i),
  ).toBeVisible()
  await exigirAccesibilidad(page, '[role="dialog"]')

  // Con solo el RUT, el asistente no envía e indica los que faltan.
  await cargarDocumentos(asistente, [DOCUMENTOS_OBLIGATORIOS[0]])
  await asistente
    .getByRole("button", { name: /registrar organización/i })
    .click()
  await expect(
    asistente.getByText(
      "Faltan documentos obligatorios: Certificado de Cámara de Comercio, " +
        "Cédula del representante legal, Formulario de afiliación a ARL",
    ),
  ).toBeVisible()

  await cargarDocumentos(asistente, DOCUMENTOS_OBLIGATORIOS.slice(1))
  await exigirAccesibilidad(page, '[role="dialog"]')
  await asistente
    .getByRole("button", { name: /registrar organización/i })
    .click()
  await expect(page.getByRole("article", { name: "Ecopetrol" })).toContainText(
    "En validación",
  )
})

test("el Administrador consulta los documentos antes de aprobar (R7.6, R7.7)", async ({
  page,
}) => {
  await ingresarComo(page, "admin")
  await expect(page).toHaveURL(/\/admin\/validacion$/)
  await page
    .getByRole("row", { name: /Ecopetrol/ })
    .getByRole("button", { name: /revisar/i })
    .click()
  const revision = page.getByRole("region", { name: /revisión de ecopetrol/i })
  const documentos = revision.getByRole("list", { name: /documentos legales/i })
  await expect(documentos.getByRole("listitem")).toHaveCount(5)
  for (const nombre of DOCUMENTOS_OBLIGATORIOS) {
    await expect(
      documentos.getByRole("listitem").filter({ hasText: nombre }),
    ).toContainText("Cargado")
  }
  await expect(
    documentos.getByRole("listitem").filter({ hasText: "no afiliación" }),
  ).toContainText("Opcional")
  await exigirAccesibilidad(page)

  await revision.getByRole("button", { name: "Ver RUT actualizado" }).click()
  const vista = page.getByTitle("RUT actualizado: RUT actualizado.pdf")
  await expect(vista).toBeVisible()
  const url = await vista.getAttribute("src")
  expect(new URL(url ?? "").searchParams.get("X-Amz-Expires")).toBe("300")
  // La URL firmada entrega el archivo ficticio que cargó el Líder SST.
  const archivo = await fetch(url ?? "")
  expect(await archivo.text()).toContain("documento ficticio: RUT actualizado")
  await exigirAccesibilidad(page, '[role="dialog"]')
  await page.getByRole("button", { name: "Cerrar" }).last().click()

  await revision.getByRole("button", { name: /aprobar/i }).click()
  await expect(page.getByRole("status")).toContainText(/aprobada/i)
})
