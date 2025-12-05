-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Admin_isActive_isDeleted_idx" ON "Admin"("isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "Permission_isActive_isDeleted_idx" ON "Permission"("isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "Role_isActive_isDeleted_idx" ON "Role"("isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "User_isActive_isDeleted_idx" ON "User"("isActive", "isDeleted");
