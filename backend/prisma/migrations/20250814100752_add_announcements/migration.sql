/*
  Warnings:

  - The values [ANNOUNCEMENT,EVENT] on the enum `ReportCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('GENERAL', 'URGENT', 'EVENT', 'MAINTENANCE', 'REGULATION');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterEnum
BEGIN;
CREATE TYPE "ReportCategory_new" AS ENUM ('INFRASTRUCTURE', 'CLEANLINESS', 'LIGHTING', 'SECURITY', 'UTILITIES', 'ENVIRONMENT', 'SUGGESTION', 'OTHER');
ALTER TABLE "reports" ALTER COLUMN "category" TYPE "ReportCategory_new" USING ("category"::text::"ReportCategory_new");
ALTER TYPE "ReportCategory" RENAME TO "ReportCategory_old";
ALTER TYPE "ReportCategory_new" RENAME TO "ReportCategory";
DROP TYPE "ReportCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "announcementId" TEXT;

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'GENERAL',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishAt" TIMESTAMP(3),
    "expireAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcements_isActive_publishAt_expireAt_idx" ON "announcements"("isActive", "publishAt", "expireAt");

-- CreateIndex
CREATE INDEX "announcements_isPinned_publishAt_createdAt_idx" ON "announcements"("isPinned", "publishAt", "createdAt");

-- CreateIndex
CREATE INDEX "announcements_authorId_createdAt_idx" ON "announcements"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "announcements_type_idx" ON "announcements"("type");

-- CreateIndex
CREATE INDEX "announcements_priority_idx" ON "announcements"("priority");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
