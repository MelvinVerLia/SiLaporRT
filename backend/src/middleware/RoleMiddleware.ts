import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client"; // pakai enum dari Prisma

export function requireRole(required: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (user.role !== required) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}
