-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_rtId_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "rtId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rtId_fkey" FOREIGN KEY ("rtId") REFERENCES "rt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
