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
  // Helper method to auto-deactivate expired announcements
  private static async autoDeactivateExpired() {
    const now = new Date();
    await prisma.announcement.updateMany({
      where: {
        isActive: true,
        expireAt: { not: null, lte: now },
      },
      data: { isActive: false },
    });
  }

  // ==== PUBLIC (citizen) ====
  static async listVisible({
    page,
    pageSize,
    q,
    type,
    priority,
    pinnedFirst,
  }: ListParams) {
    // Auto-deactivate expired announcements before fetching
    await this.autoDeactivateExpired();

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

    // Consistent ordering with admin view:
    // 1. Pinned announcements first
    // 2. Most recently updated first (same as admin)
    // 3. Creation date as fallback
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

  static async getVisibleById(id: string) {
    // Auto-deactivate expired announcements before fetching
    await this.autoDeactivateExpired();

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
    showInactiveOnly,
    dateFrom,
    dateTo,
    sortBy,
  }: ListParams & { includeInactive?: boolean; showInactiveOnly?: boolean; sortBy?: string }) {
    // Auto-deactivate expired announcements before fetching (admin juga perlu melihat status yang akurat)
    await this.autoDeactivateExpired();

    const where: any = {};

    // Logika untuk status active/inactive
    if (showInactiveOnly) {
      where.isActive = false;
    } else if (!includeInactive) {
      where.isActive = true;
    }
    // Jika includeInactive = true dan showInactiveOnly = false, tampilkan semua

    if (q && q.trim()) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ];
    }
    if (type) where.type = type;
    if (priority) where.priority = priority;

    // Add date range filter for createdAt (lebih konsisten karena semua announcement pasti punya createdAt)
    // publishAt bisa null, jadi lebih baik filter berdasarkan kapan announcement dibuat
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Set to end of day for dateTo
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const skip = (page - 1) * pageSize;

    // Determine orderBy based on sortBy parameter
    let orderBy: any;
    if (sortBy === "oldest") {
      // Oldest first
      orderBy = pinnedFirst
        ? [
            { isPinned: "desc" as const },
            { createdAt: "asc" as const },
          ]
        : [{ createdAt: "asc" as const }];
    } else {
      // Default: Newest first
      // 1. Pinned announcements first
      // 2. Most recently updated first (when create/edit, it goes to top)
      // 3. Creation date as fallback
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

  static async getByIdAdmin(id: string) {
    // Auto-deactivate expired announcements before fetching
    await this.autoDeactivateExpired();

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

  static async updateWithAttachments(
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
    attachments?: { filename: string; url: string; fileType: string }[]
  ) {
    // Map string values to enums if provided
    const updateData: any = { ...data };
    if (data.type) {
      updateData.type = data.type as any;
    }
    if (data.priority) {
      updateData.priority = data.priority as any;
    }

    // Handle attachments replacement: delete all existing, then create new ones
    if (attachments !== undefined) {
      // Use transaction to ensure atomicity
      return prisma.$transaction(async (tx) => {
        // First, delete all existing attachments
        await tx.attachment.deleteMany({
          where: { announcementId: id },
        });

        // Then update the announcement with new attachments
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

    // If no attachments update needed, just update the announcement
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
