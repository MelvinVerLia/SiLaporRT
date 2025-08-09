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

  static async updateUserGoogleID(userId: string, googleId: string) {
    return prisma.user.update({ where: { id: userId }, data: { googleId } });
  }

  static async changePassword(userId: string, password: string) {
    return prisma.user.update({ where: { id: userId }, data: { password } });
  }

  static async updatePasswordResetToken(
    userId: string,
    token: string,
    expiry: Date
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: { resetToken: token, resetTokenExp: expiry },
    });
  }
}
