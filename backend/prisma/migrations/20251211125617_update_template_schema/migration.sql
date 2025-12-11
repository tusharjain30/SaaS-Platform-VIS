/*
  Warnings:

  - The `footer` column on the `Template` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "components" JSONB,
DROP COLUMN "footer",
ADD COLUMN     "footer" JSONB;
