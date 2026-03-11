import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const rt1 = await prisma.rt.create({
    data: {
      kecamatan: "Kebayoran Baru",
      kelurahan: "Senayan",
      rw: "01",
      rt: "001",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin RT 001",
      password: "$2b$10$UKmR/.bJVbpI9G3y05QrtObukyjjqmk.MxW4SAViQ1y28D3tq2Yzq",
      email: "admin.rt001@email.com",
      role: "RT_ADMIN",
      verificationStatus: "VERIFIED",
      rtId: rt1.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
