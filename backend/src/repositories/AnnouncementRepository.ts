import prisma from "../config/prisma";

type ListParams = {
  page: number;
  pageSize: number;
  q?: string;
  type?: string;
  priority?: string;
  pinnedFirst?: boolean;
};

const visibleWhere = () => {
  const now = new Date();
  return {
    isActive: true,
    OR: [{ publishAt: null }, { publishAt: { lte: now } }],
    AND: [{ OR: [{ expireAt: null }, { expireAt: { gt: now } }] }],
  };
};

export class AnnouncementRepository {
  // ==== PUBLIC (citizen) ====
  static async listVisible({
    page,
    pageSize,
    q,
    type,
    priority,
    pinnedFirst,
  }: ListParams) {
    const where: any = { ...visibleWhere() };
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
          { publishAt: "desc" as const },
          { createdAt: "desc" as const },
        ]
      : [{ publishAt: "desc" as const }, { createdAt: "desc" as const }];

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

  static async getVisibleById(id: string) {
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
  static async listAdmin({
    page,
    pageSize,
    q,
    type,
    priority,
    pinnedFirst,
    includeInactive,
  }: ListParams & { includeInactive?: boolean }) {
    const where: any = {};
    if (!includeInactive) where.isActive = true;
    if (q && q.trim()) {
      where.OR = [
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
          { publishAt: "desc" as const },
          { createdAt: "desc" as const },
        ]
      : [{ publishAt: "desc" as const }, { createdAt: "desc" as const }];

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

  static async getByIdAdmin(id: string) {
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

  static async create({
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

  static async update(
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
    }>
  ) {
    // Map string values to enums if provided
    const updateData: any = { ...data };
    if (data.type) {
      updateData.type = data.type as any; // Replace 'as any' with your actual enum type if available
    }
    if (data.priority) {
      updateData.priority = data.priority as any; // Replace 'as any' with your actual enum type if available
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

  static async softDelete(id: string) {
    return prisma.announcement.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async setPinned(id: string, isPinned: boolean) {
    return prisma.announcement.update({
      where: { id },
      data: { isPinned },
    });
  }
}
