import { AuthRepository } from "../repositories/AuthRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
export class AuthService {
  static async getUserByEmail(email: string) {
    return await AuthRepository.getUserByEmail(email);
  }

  static async register({ email, password, name }: RegisterData) {
    const exists = await AuthRepository.getUserByEmail(email);
    if (exists) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await AuthRepository.createUser({
      email,
      password: hashedPassword,
      name: name || email.split("@")[0], 
    });

    const token = this.generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
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
    let user = await AuthRepository.findByGoogleId(googleId);

    if (!user) {
      // If not found by Google ID, try to find by email
      user = await AuthRepository.getUserByEmail(email);

      if (user) {
        // User exists with email but no Google ID - update with Google ID
        // You'd need an update method in repository for this
        throw new Error(
          "Email already registered. Please login with password or link your Google account."
        );
      } else {
        // Create new user
        user = await AuthRepository.createUser({
          email,
          name,
          googleId,
        });
      }
    }

    // Generate JWT token
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
}
