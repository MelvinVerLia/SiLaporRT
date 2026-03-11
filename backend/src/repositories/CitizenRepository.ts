import prisma from "../config/prisma";

export async function getAllCitizens({
  page,
  pageSize,
  q,
  verificationStatus,
  rtId,
}: {
  page: number;
  pageSize: number;
  q?: string;
  verificationStatus?: string;
  rtId?: string;
}) {
  const where: any = {
    role: "CITIZEN",
    isDeleted: false,
    // Only show citizens with complete profiles
    phone: { not: null },
    address: { not: null },
    rtId: { not: null },
  };

  if (rtId) where.rtId = rtId;

  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  if (verificationStatus) {
    where.verificationStatus = verificationStatus;
  }

  const skip = (page - 1) * pageSize;

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profile: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { total, items };
}

export async function verifyCitizen(citizenId: string) {
  const citizen = await prisma.user.findUnique({
    where: { id: citizenId },
    select: { role: true, isDeleted: true, verificationStatus: true },
  });

  if (!citizen || citizen.isDeleted || citizen.role !== "CITIZEN") {
    throw new Error("Citizen not found");
  }

  return prisma.user.update({
    where: { id: citizenId },
    data: { verificationStatus: "VERIFIED", updatedAt: new Date() },
    select: { id: true, name: true, verificationStatus: true },
  });
}

export async function rejectCitizen(citizenId: string) {
  const citizen = await prisma.user.findUnique({
    where: { id: citizenId },
    select: { role: true, isDeleted: true, verificationStatus: true },
  });

  if (!citizen || citizen.isDeleted || citizen.role !== "CITIZEN") {
    throw new Error("Citizen not found");
  }

  return prisma.user.update({
    where: { id: citizenId },
    data: { verificationStatus: "REJECTED", updatedAt: new Date() },
    select: { id: true, name: true, verificationStatus: true },
  });
}
