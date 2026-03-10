import { Request, Response, NextFunction } from "express";

export function requireVerified() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (user.verificationStatus !== "VERIFIED") {
      return res.status(403).json({
        success: false,
        message: "Akun Anda belum diverifikasi oleh admin RT",
      });
    }
    next();
  };
}
