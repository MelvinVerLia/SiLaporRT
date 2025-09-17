import { AuthRepository } from "../repositories/AuthRepository";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../email/EmailForm";
import { RedisClient } from "../config/RedisClient";
import otpGenerator from "otp-generator";
import { sendOTPEmail } from "../email/OTP";
import { log } from "console";
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
    phone: string
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
      JSON.stringify({ email, hashedPassword, name, phone, status: "pending" }),
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

    const { email, hashedPassword, name, phone } = JSON.parse(userPayload);
    const { hashedOtp } = JSON.parse(otpPayload);

    const inputOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp === inputOtp) {
      const user = await AuthRepository.createUser({
        email,
        password: hashedPassword,
        name,
        phone,
      });

      const token = this.generateToken(user.id);
      const { password: _pw, googleId: _gi, ...safeUser } = user;
      await redis.del(`reg:${regId}`);
      await redis.del(`otp:${regId}`);
      return { user: safeUser, token };
    } else {
      throw new Error("Invalid OTP");
    }
  }

  static async login({ email, password }: LoginData) {
    const user = await AuthRepository.getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.password) {
      throw new Error("Please login with Google");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const token = this.generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
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

    const token = this.generateToken(user.id);

    return {
      user,
      token,
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

  private static generateToken(userId: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const payload = { userId };
    const options: jwt.SignOptions = {
      // expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    };

    return jwt.sign(payload, jwtSecret, options);
  }

  static async validateToken(token: string) {
    const redis = RedisClient.instance;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const userId = await redis.get(`reset:${hashedToken}`);

    if (!userId) {
      throw new Error("Invalid or expired token");
    }

    await redis.del(`reset:${hashedToken}`);
    console.log("hello");
    return { success: true };
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
    await redis.set(`reset:${hashedToken}`, user.id, "EX", 300);

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset/${rawToken}/${user.email}`;

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
}
