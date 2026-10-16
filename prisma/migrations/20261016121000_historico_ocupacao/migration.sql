-- Migrate the current resident-to-house assignment into a historical occupancy.
CREATE TABLE "Ocupacao" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "casaId" INTEGER NOT NULL,
    "dataEntrada" TIMESTAMP(3) NOT NULL,
    "dataSaida" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ocupacao_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Ocupacao" ("usuarioId", "casaId", "dataEntrada", "dataSaida", "createdAt")
SELECT "id", "casaId", COALESCE("dataEntrada", "createdAt"), "dataSaida", "createdAt"
FROM "Usuario"
WHERE "casaId" IS NOT NULL;

CREATE UNIQUE INDEX "Ocupacao_usuarioId_casaId_dataEntrada_key"
ON "Ocupacao"("usuarioId", "casaId", "dataEntrada");

CREATE INDEX "Ocupacao_usuarioId_dataEntrada_dataSaida_idx"
ON "Ocupacao"("usuarioId", "dataEntrada", "dataSaida");

CREATE INDEX "Ocupacao_casaId_dataEntrada_dataSaida_idx"
ON "Ocupacao"("casaId", "dataEntrada", "dataSaida");

ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_casaId_fkey";
ALTER TABLE "Usuario" DROP COLUMN "casaId";
ALTER TABLE "Usuario" DROP COLUMN "dataEntrada";
ALTER TABLE "Usuario" DROP COLUMN "dataSaida";

ALTER TABLE "Ocupacao"
ADD CONSTRAINT "Ocupacao_usuarioId_fkey"
FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ocupacao"
ADD CONSTRAINT "Ocupacao_casaId_fkey"
FOREIGN KEY ("casaId") REFERENCES "Casa"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
