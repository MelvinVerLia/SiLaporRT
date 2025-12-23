import { User } from "@prisma/client";
import prisma from "../config/prisma";

export class AuthRepository {
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async getUserById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }

  static async createUser(data: any) {
    return await prisma.user.create({ data });
  }

  static async getUserByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } });
  }

  static async updateUserGoogleID(
    userId: string,
    googleId: string,
    profile: string
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: { googleId, profile },
    });
  }

  static async changePassword(userId: string, password: string) {
    return prisma.user.update({ where: { id: userId }, data: { password } });
  }

  static async deleteUser(userId: string) {
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

  static async updateProfile(userId: string, data: User) {
    return prisma.user.update({
      where: { id: userId },
      data: { ...data, updatedAt: new Date() },
    });
  }

  static async getAllUsersByRole(role: any) {
    return prisma.user.findMany({
      where: { role },
      select: { id: true, role: true },
    });
  }

  static async getAllUsers() {
    return prisma.user.count({ where: { isDeleted: false, role: "CITIZEN" } });
  }

  static async getRtAdminByUserId(userId: string) {
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
}
