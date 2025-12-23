/*
  Warnings:

  - Made the column `rtId` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_rtId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "rtId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rtId_fkey" FOREIGN KEY ("rtId") REFERENCES "rt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
