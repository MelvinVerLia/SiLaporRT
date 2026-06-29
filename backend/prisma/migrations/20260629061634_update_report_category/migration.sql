/*
  Warnings:

  - The values [LIGHTING,UTILITIES,ENVIRONMENT] on the enum `ReportCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportCategory_new" AS ENUM ('INFRASTRUCTURE', 'CLEANLINESS', 'SECURITY', 'SUGGESTION', 'OTHER');
ALTER TABLE "reports" ALTER COLUMN "category" TYPE "ReportCategory_new" USING ("category"::text::"ReportCategory_new");
ALTER TYPE "ReportCategory" RENAME TO "ReportCategory_old";
ALTER TYPE "ReportCategory_new" RENAME TO "ReportCategory";
DROP TYPE "public"."ReportCategory_old";
COMMIT;

-- DropIndex
DROP INDEX "public"."attachments_messageId_idx";
