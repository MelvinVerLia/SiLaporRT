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

  static async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({ where: { googleId } });
  }

}
