import prisma from "../config/prisma";

export class AttachmentRepository {
  static create(data: {
    filename: string;
    url: string;
    fileType: string;
    provider?: string | null;
    publicId?: string | null;
    resourceType?: string | null;
    format?: string | null;
    bytes?: number | null;
    width?: number | null;
    height?: number | null;
    linkTo?: { type: "announcement" | "report" | "profile"; id?: string };
    userId?: string; // untuk update profile
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
      width: data.width ?? null,
      height: data.height ?? null,
    };

    // Link ke entity
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
    // profile: simpan Attachment (opsional), dan update user.profile ke url terbaru
    if (data.linkTo?.type === "profile" && data.userId) {
      return prisma.$transaction([
        prisma.attachment.create({ data: base }),
        prisma.user.update({
          where: { id: data.userId },
          data: { profile: data.url },
        }),
      ]);
    }
    // default: hanya simpan attachment
    return prisma.attachment.create({ data: base });
  }

  static deleteById(id: string) {
    return prisma.attachment.delete({ where: { id } });
  }

  static findById(id: string) {
    return prisma.attachment.findUnique({ where: { id } });
  }
}
