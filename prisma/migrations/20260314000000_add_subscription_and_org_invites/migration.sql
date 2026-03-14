-- AlterTable
ALTER TABLE "organization" ADD COLUMN "stripeCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organization_stripeCustomerId_key" ON "organization"("stripeCustomerId");

-- CreateTable
CREATE TABLE "subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_organizationId_key" ON "subscription"("organizationId");

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "organization_invite" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedById" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_invite_token_key" ON "organization_invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invite_organizationId_email_key" ON "organization_invite"("organizationId", "email");

-- AddForeignKey
ALTER TABLE "organization_invite" ADD CONSTRAINT "organization_invite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_invite" ADD CONSTRAINT "organization_invite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
