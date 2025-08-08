import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();
  await prisma.report.deleteMany();

  const admin = await prisma.user.create({
    data: {
      id: "admin",
      name: "Admin",
      password: "admin",
      email: "admin@email",
      phone: "08123456788",
      role: "RT_ADMIN",
    },
  });

  const user1 = await prisma.user.create({
    data: {
      name: "Dummy One",
      password: "123",
      email: "dummy1@email.com",
      phone: "08123456789",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Dummy Two",
      password: "123",
      email: "dummy2@email.com",
      phone: "08123456790",
    },
  });

  const location1 = await prisma.location.create({
    data: {
      latitude: 1,
      longitude: 1,
      address: "Jalan Raya Pekanbaru No. 1",
      rt: "001",
      rw: "001",
      kelurahan: "Pekanbaru",
      kecamatan: "Pekanbaru",
    },
  });

  const location2 = await prisma.location.create({
    data: {
      latitude: 2,
      longitude: 2,
      address: "Jalan Raya PekanLama No. 2",
      rt: "002",
      rw: "002",
      kelurahan: "PekanLama",
      kecamatan: "PekanLama",
    },
  });

  await prisma.report.createMany({
    data: [
      {
        title: "Report Uno",
        description: "asdasd",
        category: "INFRASTRUCTURE",
        isAnonymous: false,
        isPublic: true,
        locationId: location1.id,
        userId: user1.id,
      },
      {
        title: "Report Doushce",
        description: "cyka bluyatto",
        category: "SECURITY",
        isAnonymous: false,
        isPublic: true,
        locationId: location2.id,
        userId: user2.id,
      },
    ],
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
