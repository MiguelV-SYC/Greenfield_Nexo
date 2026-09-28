-- Documentos legales (P2, T22). Ver specs/organizaciones/design.md § Modelo de datos.

-- CreateEnum
CREATE TYPE "TipoDocumentoLegal" AS ENUM ('RUT', 'CAMARA_COMERCIO', 'CEDULA_REP_LEGAL', 'FORMULARIO_ARL', 'NO_AFILIACION_ARL');

-- CreateTable
CREATE TABLE "DocumentoLegal" (
    "id" UUID NOT NULL,
    "organizacionId" UUID NOT NULL,
    "tipo" "TipoDocumentoLegal" NOT NULL,
    "version" INTEGER NOT NULL,
    "objetoClave" TEXT NOT NULL,
    "objetoVersion" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "cargadoPor" TEXT NOT NULL,
    "cargadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentoLegal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoLegal_organizacionId_tipo_version_key" ON "DocumentoLegal"("organizacionId", "tipo", "version");

-- AddForeignKey
ALTER TABLE "DocumentoLegal" ADD CONSTRAINT "DocumentoLegal_organizacionId_fkey" FOREIGN KEY ("organizacionId") REFERENCES "Organizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- R7.9: hasta 10 MB. R7.2: solo PDF o imagen (el tipo lo detecta el backend
-- por la firma del archivo, no por la extensión).
ALTER TABLE "DocumentoLegal" ADD CONSTRAINT "DocumentoLegal_tamanoBytes_check"
  CHECK ("tamanoBytes" BETWEEN 1 AND 10485760);
ALTER TABLE "DocumentoLegal" ADD CONSTRAINT "DocumentoLegal_tipoMime_check"
  CHECK ("tipoMime" IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp'));
ALTER TABLE "DocumentoLegal" ADD CONSTRAINT "DocumentoLegal_version_check"
  CHECK ("version" >= 1);

-- R7.8: las versiones no se borran ni se modifican. nexo_app recibe por
-- defecto SELECT, INSERT y UPDATE (01-roles.sh); se le quita UPDATE y nunca
-- recibe DELETE.
REVOKE UPDATE ON "DocumentoLegal" FROM nexo_app;

-- RLS (design.md § Políticas RLS): miembros y Administrador leen (R7.6,
-- R7.7); solo un miembro carga, y en su propio nombre.
ALTER TABLE "DocumentoLegal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentoLegal" FORCE ROW LEVEL SECURITY;

CREATE POLICY documento_lectura ON "DocumentoLegal" FOR SELECT
  USING (app_es_admin() OR app_es_miembro("organizacionId"));
CREATE POLICY documento_carga ON "DocumentoLegal" FOR INSERT
  WITH CHECK (
    app_es_miembro("organizacionId")
    AND "cargadoPor" = app_usuario_id()
  );
