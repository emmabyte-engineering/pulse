-- AlterTable: add keyId and permissions to api_key
ALTER TABLE "api_key" ADD COLUMN "keyId" TEXT;
ALTER TABLE "api_key" ADD COLUMN "permissions" TEXT[] DEFAULT ARRAY['ingest']::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "api_key_keyId_key" ON "api_key"("keyId");
