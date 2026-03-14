-- DropTable
DROP TABLE IF EXISTS "organization_invite";
DROP TABLE IF EXISTS "subscription";

-- RedefineTables (SQLite doesn't support DROP COLUMN, so recreate the table)
CREATE TABLE "new_organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_organization" ("id", "name", "slug", "plan", "createdAt", "updatedAt")
    SELECT "id", "name", "slug", "plan", "createdAt", "updatedAt" FROM "organization";
DROP TABLE "organization";
ALTER TABLE "new_organization" RENAME TO "organization";
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");
