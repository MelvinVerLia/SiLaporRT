/*
  Warnings:

  - Added the required column `category` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('REPORT', 'ANNOUNCEMENT');

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "category" "NotificationCategory" NOT NULL;
