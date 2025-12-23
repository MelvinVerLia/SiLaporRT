/*
  Warnings:

  - You are about to drop the column `rtId` on the `reports` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."reports" DROP CONSTRAINT "reports_rtId_fkey";

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "rtId";
