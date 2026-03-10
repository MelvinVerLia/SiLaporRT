import { Request, Response } from "express";
import CitizenService from "../services/CitizenService";

class CitizenController {
  static async getAllCitizens(req: Request, res: Response) {
    try {
      const user = req.user as { id: string; rtId?: string };
      const result = await CitizenService.getAllCitizens(req.query, user?.rtId);
      res.json({
        success: true,
        message: `Retrieved ${result.total} citizens`,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch citizens",
      });
    }
  }

  static async verifyCitizen(req: Request, res: Response) {
    try {
      const { citizenId } = req.params;
      if (!citizenId) {
        return res
          .status(400)
          .json({ success: false, message: "Citizen ID is required" });
      }

      const result = await CitizenService.verifyCitizen(citizenId);
      res.json({
        success: true,
        message: "Warga berhasil diverifikasi",
        data: result,
      });
    } catch (error: any) {
      const status = error.message === "Citizen not found" ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message || "Failed to verify citizen",
      });
    }
  }

  static async rejectCitizen(req: Request, res: Response) {
    try {
      const { citizenId } = req.params;
      if (!citizenId) {
        return res
          .status(400)
          .json({ success: false, message: "Citizen ID is required" });
      }

      const result = await CitizenService.rejectCitizen(citizenId);
      res.json({
        success: true,
        message: "Verifikasi warga ditolak",
        data: result,
      });
    } catch (error: any) {
      const status = error.message === "Citizen not found" ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message || "Failed to reject citizen",
      });
    }
  }
}

export default CitizenController;
