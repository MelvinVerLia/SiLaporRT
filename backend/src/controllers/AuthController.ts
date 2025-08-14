import { AuthService } from "../services/AuthService";
import { Request, Response } from "express";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Email and password are required" });
      }

      const result = await AuthService.login({ email, password }); // { user, token }

      res.cookie("auth", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // kalau remember me, bikin lebih lama. kalau tidak, pakai sesi (tanpa maxAge).
        ...(rememberMe ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result, // { user, token }
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to login user",
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, phone } = req.body;

      // Validation
      if (!email || !password || !phone) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and phone are required",
        });
      }

      const result = await AuthService.register({ email, password, name, phone });

      // Auto-login: set HttpOnly cookie valid 7 hari
      res.cookie("auth", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to register user",
      });
    }
  }

  static async logout(_req: Request, res: Response) {
    res.clearCookie("auth", { path: "/" });
    return res.status(200).json({ success: true, message: "Logged out" });
  }

  static async googleCallback(req: Request, res: Response) {
    try {
      const result = req.user as { user: any; token: string };
      if (!result?.token) {
        return res
          .status(400)
          .json({ success: false, message: "Google authentication failed" });
      }

      res.cookie("auth", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      });

      // redirect bersih ke home FE
      res.redirect(process.env.FRONTEND_URL || "/");
    } catch (error) {
      res.status(500).json({ success: false, message: "Google auth failed" });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      // User should be attached by auth middleware
      const user = req.user;

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to get profile",
      });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send password reset email",
      });
    }
  }

  static async validateToken(req: Request, res: Response) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }

      const result = await AuthService.validateToken(token);
      console.log("result", result);
      res.status(200).json({
        success: true,
        message: "Token is valid",
        data: result,
      });
    } catch (error) {
      console.log("error", error);
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to validate token",
      });
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "email, and password are required",
        });
      }

      await AuthService.changePassword(email, password);

      res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to change password",
      });
    }
  }
}
