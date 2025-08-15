/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "bytes" INTEGER,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "publicId" TEXT,
ADD COLUMN     "resourceType" TEXT,
ADD COLUMN     "width" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "attachments_publicId_key" ON "attachments"("publicId");
