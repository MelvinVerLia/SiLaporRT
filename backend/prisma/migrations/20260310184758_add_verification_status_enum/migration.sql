-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable: safely convert String column to enum using USING cast
ALTER TABLE "users" ALTER COLUMN "verificationStatus" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "verificationStatus" TYPE "VerificationStatus" USING "verificationStatus"::"VerificationStatus";
ALTER TABLE "users" ALTER COLUMN "verificationStatus" SET DEFAULT 'UNVERIFIED';
