/*
  Warnings:

  - The values [PENDING] on the enum `TemplateStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId,name,language]` on the table `Template` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TemplateStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."Template" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Template" ALTER COLUMN "status" TYPE "TemplateStatus_new" USING ("status"::text::"TemplateStatus_new");
ALTER TYPE "TemplateStatus" RENAME TO "TemplateStatus_old";
ALTER TYPE "TemplateStatus_new" RENAME TO "TemplateStatus";
DROP TYPE "public"."TemplateStatus_old";
ALTER TABLE "Template" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metaTemplateId" TEXT,
ADD COLUMN     "rejectReason" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Template_status_isActive_isDeleted_idx" ON "Template"("status", "isActive", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Template_userId_name_language_key" ON "Template"("userId", "name", "language");
