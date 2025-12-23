-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "rtId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rtId" TEXT;

-- CreateTable
CREATE TABLE "rt" (
    "id" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "rt" TEXT NOT NULL,

    CONSTRAINT "rt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rt_rt_rw_kelurahan_kecamatan_key" ON "rt"("rt", "rw", "kelurahan", "kecamatan");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rtId_fkey" FOREIGN KEY ("rtId") REFERENCES "rt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_rtId_fkey" FOREIGN KEY ("rtId") REFERENCES "rt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
