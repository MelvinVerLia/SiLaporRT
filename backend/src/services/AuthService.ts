import { AuthRepository } from "../repositories/AuthRepository";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../email/EmailForm";
import { RedisClient } from "../config/RedisClient";
import otpGenerator from "otp-generator";
import { sendOTPEmail } from "../email/OTP";

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

  static async register({ email, password, name, phone }: RegisterData) {
    const exists = await AuthRepository.getUserByEmail(email);
    if (exists) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await AuthRepository.createUser({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0],
      phone,
    });

    const token = this.generateToken(user.id);

    const { password: _pw, googleId: _gi, ...safeUser } = user;

    return { user: safeUser, token };
  }

  static async sendOtp(email: string) {
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const redis = RedisClient.instance;
    await redis.set(email, otp);
    await sendOTPEmail(email, otp, 5);
  }

  static async validateOtp(email: string, otp: string) {
    const redis = RedisClient.instance;
    const storedOtp = await redis.get(email);
    if (storedOtp === otp) {
      this.register({ email, password: "password", name: "name" });
      return true;
    } else {
      return false;
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

    if (!email) {
      throw new Error("No email found in Google profile");
    }

    // Try to find user by Google ID first
    let user = await AuthRepository.getUserByGoogleId(googleId);

    if (!user) {
      user = await AuthRepository.getUserByEmail(email);

      if (!user) {
        user = await AuthRepository.createUser({
          email,
          name,
          googleId,
        });
      } else {
        user = await AuthRepository.updateUserGoogleID(user.id, googleId);
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

  // static async forgotPassword(email: string) {
  //   const user = await AuthRepository.getUserByEmail(email);
  //   if (!user) {
  //     throw new Error("User not found");
  //   }

  //   const rawToken = crypto.randomBytes(20).toString("hex");
  //   const hashedToken = await hash(rawToken, 10);
  //   const expiry = new Date(Date.now() + 5 * 60 * 1000);

  //   console.log(`NOW ${Date.now()} expiry ${expiry}`);
  //   await AuthRepository.updatePasswordResetToken(user.id, hashedToken, expiry);
  //   const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset/${rawToken}/${user.email}`;

  //   await sendPasswordResetEmail(email, resetPasswordUrl, 5);
  // }

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

  static async changePassword(email: string, password: string) {
    const user = await AuthRepository.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const response = await AuthRepository.changePassword(
      user.id,
      hashedPassword
    );
    return response;
  }
}
