import prisma from "../config/prisma";

export function create(data: {
  filename: string;
  url: string;
  fileType: string;
  provider?: string | null;
  publicId?: string | null;
  resourceType?: string | null;
  format?: string | null;
  bytes?: number | null;
  linkTo?: { type: "announcement" | "report" | "profile"; id?: string };
  userId?: string;
}) {
  const base = {
    filename: data.filename,
    url: data.url,
    fileType: data.fileType,
    provider: data.provider ?? "cloudinary",
    publicId: data.publicId ?? null,
    resourceType: data.resourceType ?? null,
    format: data.format ?? null,
    bytes: data.bytes ?? null,
  };

  if (data.linkTo?.type === "announcement" && data.linkTo.id) {
    return prisma.attachment.create({
      data: { ...base, announcement: { connect: { id: data.linkTo.id } } },
    });
  }
  if (data.linkTo?.type === "report" && data.linkTo.id) {
    return prisma.attachment.create({
      data: { ...base, report: { connect: { id: data.linkTo.id } } },
    });
  }
  if (data.linkTo?.type === "profile" && data.userId) {
    return prisma.$transaction([
      prisma.attachment.create({ data: base }),
      prisma.user.update({
        where: { id: data.userId },
        data: { profile: data.url },
      }),
    ]);
  }
  return prisma.attachment.create({ data: base });
}

export function deleteById(id: string) {
  return prisma.attachment.delete({ where: { id } });
}

export function findById(id: string) {
  return prisma.attachment.findUnique({ where: { id } });
}
