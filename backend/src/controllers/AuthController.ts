import { AuthService } from "../services/AuthService";
import { Request, Response } from "express";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await AuthService.login({ email, password });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to login user",
      });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await AuthService.register({ email, password, name });

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

  static async googleCallback(req: Request, res: Response) {
    try {
      // The user should be attached by passport middleware
      const result = req.user as { user: any; token: string };

      if (!result) {
        return res.status(400).json({
          success: false,
          message: "Google authentication failed",
        });
      }

      // Redirect to frontend with token (adjust URL as needed)
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/success?token=${result.token}`
      );
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Google auth failed",
      });
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
}
