import { json } from "stream/consumers";
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

  // static async register(req: Request, res: Response) {
  //   try {
  //     const { email, password, name } = req.body;

  //     // Validation
  //     if (!email || !password) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Email and password are required",
  //       });
  //     }

  //     const result = await AuthService.register({ email, password, name });

  //     // Auto-login: set HttpOnly cookie valid 7 hari
  //     res.cookie("auth", result.token, {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === "production",
  //       sameSite: "lax",
  //       path: "/",
  //       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  //     });

  //     res.status(201).json({
  //       success: true,
  //       message: "User registered successfully",
  //       data: result,
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message:
  //         error instanceof Error ? error.message : "Failed to register user",
  //     });
  //   }
  // }

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

  // static async getProfile(req: Request, res: Response) {
  //   try {
  //     // User should be attached by auth middleware
  //     const user = req.user;
  //     console.log(user);
  //     res.status(200).json({
  //       success: true,
  //       data: { user },
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       success: false,
  //       message:
  //         error instanceof Error ? error.message : "Failed to get profile",
  //     });
  //   }
  // }

  static async getProfile(req: Request, res: Response) {
    try {
      const user = JSON.parse(JSON.stringify(req.user));
      console.log(user);
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            profile: user.profile,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error) {
      console.log(error);
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
      const { token, email } = req.body;
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const result = await AuthService.validateToken(token, email);
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

  static async changeForgotPassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log(email, password);
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }

      await AuthService.changeForgotPassword(email, password);

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

  static async changePassword(req: Request, res: Response) {
    try {
      const { password } = req.body;
      const userId = JSON.parse(JSON.stringify(req.user)).id;
      console.log("userId", userId);

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "email, and password are required",
        });
      }

      await AuthService.changePassword(userId, password);

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

  static async sendOtp(req: Request, res: Response) {
    const { email, password, name, phone } = req.body;
    try {
      const response = await AuthService.sendOtp(email, password, name, phone);
      res.json({
        success: true,
        message: "OTP sent successfully",
        token: response,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send OTP",
      });
    }
  }

  static async resendOtp(req: Request, res: Response) {
    const { token } = req.body;
    try {
      await AuthService.resendOtp(token);
      res.json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send OTP",
      });
    }
  }

  static async register(req: Request, res: Response) {
    console.log("masuk validate Token");
    const { token, otp } = req.body;
    try {
      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Token is required",
        });
      }
      const result = await AuthService.register(token, otp);
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

  static async deleteAccount(req: Request, res: Response) {
    const user = JSON.parse(JSON.stringify(req.user));

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const userId = user.id;
    console.log("userId", user.id);
    try {
      await AuthService.deleteAccount(userId);
      res.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete account",
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = JSON.parse(JSON.stringify(req.user)).id;
    const data = req.body;
    try {
      const result = await AuthService.updateProfile(userId, data);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: {
          id: result.id,
          name: result.name,
          phone: result.phone,
          email: result.email,
          profile: result.profile,
          role: result.role,
          isActive: result.isActive,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update user",
      });
    }
  }
}
