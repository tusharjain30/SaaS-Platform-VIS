/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `AccessToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AccessToken_userId_isActive_idx";

-- AlterTable
ALTER TABLE "AccessToken" DROP COLUMN "expiresAt";

-- CreateIndex
CREATE INDEX "AccessToken_userId_service_isActive_idx" ON "AccessToken"("userId", "service", "isActive");
