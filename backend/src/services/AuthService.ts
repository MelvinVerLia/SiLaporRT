import { AuthRepository } from "../repositories/AuthRepository";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../email/EmailForm";
import { RedisClient } from "../config/RedisClient";
import otpGenerator from "otp-generator";
import { sendOTPEmail } from "../email/OTP";
import { User } from "@prisma/client";

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
export class AuthService {
  static async getUserByEmail(email: string) {
    return await AuthRepository.getUserByEmail(email);
  }

  static async sendOtp(
    email: string,
    password: string,
    name: string,
    phone: string,
    address: string,
    rtId: string
  ) {
    const exists = await AuthRepository.getUserByEmail(email);
    if (exists) {
      throw new Error("Email sudah terdaftar");
    }

    const redis = RedisClient.instance;
    const regId = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);
    await redis.set(
      `reg:${regId}`,
      JSON.stringify({
        email,
        hashedPassword,
        name,
        phone,
        address,
        rtId,
        status: "pending",
      }),
      "EX",
      600
    );

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await redis.set(`otp:${regId}`, JSON.stringify({ hashedOtp }), "EX", 300);
    await sendOTPEmail(email, otp, 5);

    return regId;
  }

  static async resendOtp(regId: string) {
    const redis = RedisClient.instance;
    const payload = await redis.get(`reg:${regId}`);
    if (!payload) {
      throw new Error("Invalid token");
    }
    const payloadJSON = JSON.parse(payload);
    const { email } = payloadJSON;
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    await redis.set(`otp:${regId}`, JSON.stringify({ hashedOtp }), "EX", 300);
    await sendOTPEmail(email, otp, 5);

    return true;
  }

  static async register(regId: string, otp: string) {
    const redis = RedisClient.instance;
    const [userPayload, otpPayload] = await Promise.all([
      redis.get(`reg:${regId}`),
      redis.get(`otp:${regId}`),
    ]);
    if (!userPayload || !otpPayload) {
      throw new Error("Invalid token");
    }

    const { email, hashedPassword, name, phone, address, rtId } =
      JSON.parse(userPayload);
    const { hashedOtp } = JSON.parse(otpPayload);

    const inputOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp === inputOtp) {
      const user = await AuthRepository.createUser({
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        rtId,
      });

      const { password: _pw, googleId: _gi, ...safeUser } = user;
      await redis.del(`reg:${regId}`);
      await redis.del(`otp:${regId}`);
      return { user: safeUser };
    } else {
      throw new Error("Invalid OTP");
    }
  }

  static async login({ email, password }: LoginData, rememberMe: boolean) {
    const user = await AuthRepository.getUserByEmail(email);
    if (!user || !user.password) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id, rememberMe);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  static async handleGoogleAuth(profile: any) {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const avatar = profile.photos?.[0]?.value;

    if (!email) {
      throw new Error("No email found in Google profile");
    }

    let user = await AuthRepository.getUserByGoogleId(googleId);
    if (!user) {
      user = await AuthRepository.getUserByEmail(email);

      if (!user) {
        user = await AuthRepository.createUser({
          email,
          name,
          googleId,
          profile: avatar,
        });
      } else {
        user = await AuthRepository.updateUserGoogleID(
          user.id,
          googleId,
          avatar
        );
      }
    }

    if (!user) {
      throw new Error("User not found after Google authentication");
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user = await AuthRepository.getUserById(decoded.userId);
      return user;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  private static generateAccessToken(userId: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      throw new Error("JWT_SECRET is not defined in environment variables");
    return jwt.sign({ userId }, jwtSecret, { expiresIn: "15m" });
  }

  private static async generateRefreshToken(
    userId: string,
    rememberMe?: boolean
  ): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    if (rememberMe) {
      await RedisClient.instance.set(
        `refresh:${hashedToken}`,
        JSON.stringify({ userId }),
        "EX",
        7 * 24 * 60 * 60 + 300
      );
    } else {
      await RedisClient.instance.set(
        `refresh:${hashedToken}`,
        JSON.stringify({ userId }),
        "EX",
        24 * 60 * 60 + 300
      );
    }

    return rawToken;
  }

  static async refreshToken(cookieRefreshToken: string) {
    const hashedCookieRefreshToken = crypto
      .createHash("sha256")
      .update(cookieRefreshToken)
      .digest("hex");

    const redisRefreshToken = await RedisClient.instance.get(
      `refresh:${hashedCookieRefreshToken}`
    );

    const userId = JSON.parse(redisRefreshToken!).userId;
    const newAccessToken = this.generateAccessToken(userId);

    return newAccessToken;
  }

  //untuk forgotpassword
  static async validateToken(token: string, email: string) {
    const user = await AuthRepository.getUserByEmail(email);
    if (!user) throw new Error("User not found");
    const userId = user.id;

    const redis = RedisClient.instance;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const savedToken = await redis.get(`reset:${userId}`);

    if (hashedToken !== savedToken) throw new Error("Invalid token");

    return { success: true };
  }

  static async changeForgotPassword(email: string, password: string) {
    const user = await AuthRepository.getUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const userId = user.id;
    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await AuthRepository.changePassword(
      userId,
      hashedPassword
    );

    const redis = RedisClient.instance;

    await redis.del(`reset:${userId}`);

    return response;
  }

  static async forgotPassword(email: string) {
    const user = await AuthRepository.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const redis = RedisClient.instance;
    await redis.set(`reset:${user.id}`, hashedToken, "EX", 300);

    const baseUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL;

    const resetPasswordUrl = `${baseUrl}/reset/${rawToken}/${user.email}`;
    await sendPasswordResetEmail(email, resetPasswordUrl, 5);
  }

  static async changePassword(userId: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await AuthRepository.changePassword(
      userId,
      hashedPassword
    );

    return response;
  }

  static async deleteAccount(userId: string) {
    await AuthRepository.deleteUser(userId);
    return true;
  }

  static async updateProfile(userId: string, data: User) {
    const user = await AuthRepository.updateProfile(userId, data);
    return user;
  }

  static async logout(token: string) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    await RedisClient.instance.del(`refresh:${hashedToken}`);

    return true;
  }

  static async getAllUsers() {
    const users = await AuthRepository.getAllUsers();
    return users;
  }

  static async getAllRTAdmins(search: string) {
    const users = await AuthRepository.getAllRTAdmins(search);
    return users;
  }

  static async getAllAvailableKecamatan() {
    const kecamatan = await AuthRepository.getAllAvailableKecamatan();
    return kecamatan;
  }

  static async getAllAvailableKelurahan(kecamatan: string) {
    const kelurahan = await AuthRepository.getAllAvailableKelurahan(kecamatan);
    return kelurahan;
  }

  static async getAllAvailableRW(kecamatan: string, kelurahan: string) {
    const rw = await AuthRepository.getAllAvailableRW(kecamatan, kelurahan);
    return rw;
  }

  static async getAllAvailableRT(
    kecamatan: string,
    kelurahan: string,
    rw: string
  ) {
    const rt = await AuthRepository.getAllAvailableRT(kecamatan, kelurahan, rw);
    return rt;
  }

  static async getAllAvailableRTLocation() {
    const rt = await AuthRepository.getAllAvailableRTLocation();
    return rt;
  }

  static async getRtLocationBasedOnRtId(rtId: string) {
    const location = await AuthRepository.getRtLocationBasedOnRtId(rtId);
    return location;
  }
}
