-- AlterTable: add keyId and permissions to api_key
ALTER TABLE "api_key" ADD COLUMN "key_id" TEXT;
ALTER TABLE "api_key" ADD COLUMN "permissions" TEXT[] DEFAULT ARRAY['ingest']::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "api_key_key_id_key" ON "api_key"("key_id");
