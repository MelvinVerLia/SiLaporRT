import { User } from "@prisma/client";
import prisma from "../config/prisma";

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: any) {
  return await prisma.user.create({ data });
}

export async function getUserByGoogleId(googleId: string) {
  return prisma.user.findUnique({ where: { googleId } });
}

export async function updateUserGoogleID(
  userId: string,
  googleId: string,
  profile: string,
) {
  return prisma.user.update({
    where: { id: userId },
    data: { googleId, profile },
  });
}

export async function changePassword(userId: string, password: string) {
  return prisma.user.update({ where: { id: userId }, data: { password } });
}

export async function deleteUser(userId: string) {
  try {
    const hi = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        googleId: null,
        phone: null,
        profile: null,
        email: null,
        password: null,
        role: "NULL",
      },
    });
    console.log("wtf is this", hi);
    return hi;
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
}

export async function updateProfile(userId: string, data: User) {
  return prisma.user.update({
    where: { id: userId },
    data: { ...data, updatedAt: new Date() },
  });
}

export async function getAllUsersByRole(role: any) {
  return prisma.user.findMany({
    where: { role },
    select: { id: true, role: true },
  });
}

export async function getAllUsers() {
  return prisma.user.count({ where: { isDeleted: false, role: "CITIZEN" } });
}

export async function getRtAdminByUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { rtId: true },
  });

  if (!user?.rtId) return null;

  return prisma.user.findMany({
    where: {
      rtId: user.rtId,
      role: "RT_ADMIN",
      isDeleted: false,
    },
  });
}

export async function getAllRTAdmins(search: string) {
  return prisma.user.findMany({
    where: {
      role: "RT_ADMIN",
      isDeleted: false,
      name: { contains: search, mode: "insensitive" },
    },
    select: { name: true, rtId: true },
  });
}

export async function getAllAvailableKecamatan() {
  return prisma.rt.findMany({
    distinct: ["kecamatan"],
    select: { kecamatan: true },
  });
}

export async function getAllAvailableKelurahan(kecamatan: string) {
  return prisma.rt.findMany({
    where: { kecamatan },
    distinct: ["kelurahan"],
    select: { kelurahan: true },
  });
}

export async function getAllAvailableRW(kecamatan: string, kelurahan: string) {
  return prisma.rt.findMany({
    where: { kecamatan, kelurahan },
    distinct: ["rw"],
    select: { rw: true },
  });
}

export async function getAllAvailableRT(
  kecamatan: string,
  kelurahan: string,
  rw: string,
) {
  return prisma.rt.findMany({
    where: { kecamatan, kelurahan, rw },
    distinct: ["rt"],
    select: { rt: true },
  });
}

export async function getAllAvailableRTLocation() {
  return prisma.rt.findMany();
}

export async function getRtLocationBasedOnRtId(rtId: string) {
  return prisma.rt.findFirst({
    where: { id: rtId },
  });
}
