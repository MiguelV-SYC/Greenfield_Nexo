-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EstadoOrganizacion" AS ENUM ('EN_VALIDACION', 'DEVUELTA', 'APROBADA');

-- CreateEnum
CREATE TYPE "TipoPersona" AS ENUM ('JURIDICA', 'NATURAL');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CC', 'CE', 'PASAPORTE');

-- CreateEnum
CREATE TYPE "ClaseRiesgo" AS ENUM ('I', 'II', 'III', 'IV', 'V');

-- CreateEnum
CREATE TYPE "RolOrganizacion" AS ENUM ('LIDER_SST');

-- CreateTable
CREATE TABLE "Organizacion" (
    "id" UUID NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "tipoPersona" "TipoPersona" NOT NULL DEFAULT 'JURIDICA',
    "nit" TEXT NOT NULL,
    "digitoVerificacion" CHAR(1) NOT NULL,
    "repLegalNombre" TEXT NOT NULL,
    "repLegalTipoDoc" "TipoDocumento",
    "repLegalNumeroDoc" TEXT,
    "apoderadoNombre" TEXT,
    "arlCodigo" TEXT,
    "estado" "EstadoOrganizacion" NOT NULL DEFAULT 'EN_VALIDACION',
    "motivoDevolucion" TEXT,
    "enviadaEn" TIMESTAMPTZ(3) NOT NULL,
    "riesgoMaximo" "ClaseRiesgo" NOT NULL,
    "totalTrabajadores" INTEGER NOT NULL,
    "estandaresAplicables" INTEGER NOT NULL,
    "creadaEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Organizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sede" (
    "id" UUID NOT NULL,
    "organizacionId" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "departamentoCodigo" TEXT NOT NULL,
    "municipioCodigo" TEXT NOT NULL,
    "claseRiesgo" "ClaseRiesgo" NOT NULL,
    "trabajadores" INTEGER NOT NULL,
    "ciiuCodigo" TEXT NOT NULL,

    CONSTRAINT "Sede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MiembroOrganizacion" (
    "id" UUID NOT NULL,
    "organizacionId" UUID NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "rol" "RolOrganizacion" NOT NULL,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MiembroOrganizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditoriaCambio" (
    "id" UUID NOT NULL,
    "organizacionId" UUID NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "valorAnterior" JSONB,
    "valorNuevo" JSONB,
    "motivo" TEXT,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditoriaCambio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departamento" (
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "departamentoCodigo" TEXT NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "ActividadCiiu" (
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "ActividadCiiu_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "Arl" (
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Arl_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "CatalogoVersion" (
    "catalogo" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "fechaCorte" DATE NOT NULL,

    CONSTRAINT "CatalogoVersion_pkey" PRIMARY KEY ("catalogo")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organizacion_nit_key" ON "Organizacion"("nit");

-- CreateIndex
CREATE INDEX "Organizacion_estado_enviadaEn_idx" ON "Organizacion"("estado", "enviadaEn");

-- CreateIndex
CREATE INDEX "Sede_organizacionId_idx" ON "Sede"("organizacionId");

-- CreateIndex
CREATE INDEX "MiembroOrganizacion_usuarioId_idx" ON "MiembroOrganizacion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "MiembroOrganizacion_organizacionId_usuarioId_key" ON "MiembroOrganizacion"("organizacionId", "usuarioId");

-- CreateIndex
CREATE INDEX "AuditoriaCambio_organizacionId_creadoEn_idx" ON "AuditoriaCambio"("organizacionId", "creadoEn");

-- CreateIndex
CREATE INDEX "Municipio_departamentoCodigo_idx" ON "Municipio"("departamentoCodigo");

-- CreateIndex
CREATE UNIQUE INDEX "Municipio_codigo_departamentoCodigo_key" ON "Municipio"("codigo", "departamentoCodigo");

-- AddForeignKey
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_arlCodigo_fkey" FOREIGN KEY ("arlCodigo") REFERENCES "Arl"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sede" ADD CONSTRAINT "Sede_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sede" ADD CONSTRAINT "Sede_municipioCodigo_departamentoCodigo_fkey" FOREIGN KEY ("municipioCodigo", "departamentoCodigo") REFERENCES "Municipio"("codigo", "departamentoCodigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sede" ADD CONSTRAINT "Sede_ciiuCodigo_fkey" FOREIGN KEY ("ciiuCodigo") REFERENCES "ActividadCiiu"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MiembroOrganizacion" ADD CONSTRAINT "MiembroOrganizacion_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Municipio" ADD CONSTRAINT "Municipio_departamentoCodigo_fkey" FOREIGN KEY ("departamentoCodigo") REFERENCES "Departamento"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Restricciones que Prisma no expresa (specs/organizaciones/design.md)
-- ---------------------------------------------------------------------------

-- R1.5 / R1.6: NIT solo dígitos; DV de un dígito.
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_nit_digitos_check"
  CHECK ("nit" ~ '^[0-9]+$');
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_digitoVerificacion_check"
  CHECK ("digitoVerificacion" ~ '^[0-9]$');

-- R3.1–R3.4: solo 7, 21 o 62 estándares; derivados coherentes (DEC-6).
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_estandaresAplicables_check"
  CHECK ("estandaresAplicables" IN (7, 21, 62));
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_totalTrabajadores_check"
  CHECK ("totalTrabajadores" >= 1);

-- R4.4 / R4.5: una organización Devuelta siempre tiene motivo no vacío.
ALTER TABLE "Organizacion" ADD CONSTRAINT "Organizacion_motivoDevolucion_check"
  CHECK ("estado" <> 'DEVUELTA' OR length(btrim("motivoDevolucion")) > 0);

-- R2.4: al menos un trabajador por sede.
ALTER TABLE "Sede" ADD CONSTRAINT "Sede_trabajadores_check"
  CHECK ("trabajadores" >= 1);

-- ---------------------------------------------------------------------------
-- Permisos de nexo_app (ADR-0001). Por defecto recibe SELECT, INSERT y UPDATE
-- (01-roles.sh); aquí se ajusta tabla por tabla.
-- ---------------------------------------------------------------------------

-- El historial de migraciones no es de la aplicación.
REVOKE ALL ON "_prisma_migrations" FROM nexo_app;

-- NFR4 / R6.3: auditoría append-only.
REVOKE UPDATE ON "AuditoriaCambio" FROM nexo_app;

-- DEC-7: catálogos de solo lectura para la aplicación; los siembra nexo_migrador.
REVOKE INSERT, UPDATE ON "Departamento", "Municipio", "ActividadCiiu", "Arl", "CatalogoVersion" FROM nexo_app;

-- R4.6 / R8.2: corregir o editar reemplaza el conjunto de sedes.
GRANT DELETE ON "Sede" TO nexo_app;
