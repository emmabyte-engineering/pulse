-- DropForeignKey
ALTER TABLE "organization_invite" DROP CONSTRAINT "organization_invite_organizationId_fkey";
ALTER TABLE "organization_invite" DROP CONSTRAINT "organization_invite_invitedById_fkey";
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_organizationId_fkey";

-- DropTable
DROP TABLE "organization_invite";
DROP TABLE "subscription";

-- DropIndex
DROP INDEX "organization_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "stripeCustomerId";
