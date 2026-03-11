import prisma from "../config/prisma";

type ListParams = {
  page: number;
  pageSize: number;
  q?: string;
  type?: string;
  priority?: string;
  pinnedFirst?: boolean;
  dateFrom?: string;
  dateTo?: string;
  rtId?: string;
};

const visibleWhere = () => {
  const now = new Date();
  return {
    isActive: true,
    OR: [{ publishAt: null }, { publishAt: { lte: now } }],
    AND: [{ OR: [{ expireAt: null }, { expireAt: { gt: now } }] }],
  };
};

async function autoDeactivateExpired() {
  const now = new Date();
  await prisma.announcement.updateMany({
    where: {
      isActive: true,
      expireAt: { not: null, lte: now },
    },
    data: { isActive: false },
  });
}

export async function listVisible({
  page,
  pageSize,
  q,
  type,
  priority,
  pinnedFirst,
  rtId,
}: ListParams) {
  await autoDeactivateExpired();

  const where: any = { ...visibleWhere() };

  if (rtId) {
    where.author = {
      rtId: rtId,
    };
  }

  if (q && q.trim()) {
    where.OR = [
      ...(where.OR || []),
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }
  if (type) where.type = type;
  if (priority) where.priority = priority;

  const skip = (page - 1) * pageSize;

  const orderBy = pinnedFirst
    ? [
        { isPinned: "desc" as const },
        { updatedAt: "desc" as const },
        { createdAt: "desc" as const },
      ]
    : [{ updatedAt: "desc" as const }, { createdAt: "desc" as const }];

  const [total, items] = await Promise.all([
    prisma.announcement.count({ where }),
    prisma.announcement.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      include: {
        author: { select: { id: true, name: true, email: true } },
        attachments: {
          select: { id: true, filename: true, url: true, fileType: true },
        },
      },
    }),
  ]);
  return { total, items };
}

export async function getVisibleById(id: string) {
  await autoDeactivateExpired();

  const where = { AND: [{ id }, visibleWhere()] } as any;
  return prisma.announcement.findFirst({
    where,
    include: {
      author: { select: { id: true, name: true, email: true } },
      attachments: {
        select: { id: true, filename: true, url: true, fileType: true },
      },
    },
  });
}

// ==== ADMIN ====
export async function listAdmin({
  page,
  pageSize,
  q,
  type,
  priority,
  pinnedFirst,
  includeInactive,
  showInactiveOnly,
  dateFrom,
  dateTo,
  sortBy,
  rtId,
}: ListParams & {
  includeInactive?: boolean;
  showInactiveOnly?: boolean;
  sortBy?: string;
}) {
  await autoDeactivateExpired();

  const where: any = {};

  if (showInactiveOnly) {
    where.isActive = false;
  } else if (!includeInactive) {
    where.isActive = true;
  }

  if (rtId) {
    where.author = {
      rtId: rtId,
    };
  }

  if (q && q.trim()) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }
  if (type) where.type = type;
  if (priority) where.priority = priority;

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const skip = (page - 1) * pageSize;

  let orderBy: any;
  if (sortBy === "oldest") {
    orderBy = pinnedFirst
      ? [{ isPinned: "desc" as const }, { createdAt: "asc" as const }]
      : [{ createdAt: "asc" as const }];
  } else {
    orderBy = pinnedFirst
      ? [
          { isPinned: "desc" as const },
          { updatedAt: "desc" as const },
          { createdAt: "desc" as const },
        ]
      : [{ updatedAt: "desc" as const }, { createdAt: "desc" as const }];
  }

  const [total, items] = await Promise.all([
    prisma.announcement.count({ where }),
    prisma.announcement.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      include: {
        author: { select: { id: true, name: true, email: true } },
        attachments: {
          select: { id: true, filename: true, url: true, fileType: true },
        },
      },
    }),
  ]);
  return { total, items };
}

export async function getByIdAdmin(id: string) {
  await autoDeactivateExpired();

  return prisma.announcement.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      attachments: {
        select: { id: true, filename: true, url: true, fileType: true },
      },
    },
  });
}

export async function create({
  authorId,
  data,
  attachments,
}: {
  authorId: string;
  data: {
    title: string;
    content: string;
    type?: string;
    priority?: string;
    isPinned?: boolean;
    publishAt?: Date | null;
    expireAt?: Date | null;
    isActive?: boolean;
  };
  attachments?: { filename: string; url: string; fileType: string }[];
}) {
  return prisma.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      type: (data.type as any) ?? "GENERAL",
      priority: (data.priority as any) ?? "NORMAL",
      isPinned: data.isPinned ?? false,
      publishAt: data.publishAt ?? null,
      expireAt: data.expireAt ?? null,
      isActive: data.isActive ?? true,
      author: { connect: { id: authorId } },
      attachments: attachments?.length
        ? {
            create: attachments.map((a) => ({
              filename: a.filename,
              url: a.url,
              fileType: a.fileType,
            })),
          }
        : undefined,
    },
    include: {
      author: { select: { id: true, name: true, email: true } },
      attachments: {
        select: { id: true, filename: true, url: true, fileType: true },
      },
    },
  });
}

export async function update(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    type: string;
    priority: string;
    isPinned: boolean;
    publishAt: Date | null;
    expireAt: Date | null;
    isActive: boolean;
  }>,
) {
  const updateData: any = { ...data };
  if (data.type) {
    updateData.type = data.type as any;
  }
  if (data.priority) {
  }
  return prisma.announcement.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, email: true } },
      attachments: {
        select: { id: true, filename: true, url: true, fileType: true },
      },
    },
  });
}

export async function updateWithAttachments(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    type: string;
    priority: string;
    isPinned: boolean;
    publishAt: Date | null;
    expireAt: Date | null;
    isActive: boolean;
  }>,
  attachments?: { filename: string; url: string; fileType: string }[],
) {
  const updateData: any = { ...data };
  if (data.type) {
    updateData.type = data.type as any;
  }
  if (data.priority) {
    updateData.priority = data.priority as any;
  }

  if (attachments !== undefined) {
    return prisma.$transaction(async (tx) => {
      await tx.attachment.deleteMany({
        where: { announcementId: id },
      });

      return tx.announcement.update({
        where: { id },
        data: {
          ...updateData,
          attachments: attachments.length
            ? {
                create: attachments.map((a) => ({
                  filename: a.filename,
                  url: a.url,
                  fileType: a.fileType,
                })),
              }
            : undefined,
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
          attachments: {
            select: { id: true, filename: true, url: true, fileType: true },
          },
        },
      });
    });
  }

  return prisma.announcement.update({
    where: { id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, email: true } },
      attachments: {
        select: { id: true, filename: true, url: true, fileType: true },
      },
    },
  });
}

export async function softDelete(id: string) {
  return prisma.announcement.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function setPinned(id: string, isPinned: boolean) {
  return prisma.announcement.update({
    where: { id },
    data: { isPinned },
  });
}
