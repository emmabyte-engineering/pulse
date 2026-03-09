-- AlterTable
ALTER TABLE "waitlist_entry" ADD COLUMN     "invitedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "invite_token" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invite_token_token_key" ON "invite_token"("token");

-- CreateIndex
CREATE INDEX "invite_token_token_idx" ON "invite_token"("token");

-- CreateIndex
CREATE INDEX "invite_token_email_idx" ON "invite_token"("email");
