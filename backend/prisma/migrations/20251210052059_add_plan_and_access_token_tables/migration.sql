/*
  Warnings:

  - You are about to drop the column `messageLimit` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `maxTemplates` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('TEMPLATE', 'BOT', 'MESSAGE');

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "messageLimit",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxBots" INTEGER,
ADD COLUMN     "maxTemplates" INTEGER NOT NULL,
ADD COLUMN     "monthlyMessageLimit" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "endDate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AccessToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "service" "ServiceType" NOT NULL,
    "limitValue" INTEGER,
    "usedValue" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccessToken_userId_isActive_idx" ON "AccessToken"("userId", "isActive");

-- CreateIndex
CREATE INDEX "Plan_isActive_isDeleted_idx" ON "Plan"("isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "Subscription_userId_isActive_idx" ON "Subscription"("userId", "isActive");

-- AddForeignKey
ALTER TABLE "AccessToken" ADD CONSTRAINT "AccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
