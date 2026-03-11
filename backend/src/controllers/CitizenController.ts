import { Request, Response } from "express";
import {
  getAllCitizens as getAllCitizensRepo,
  verifyCitizen as verifyCitizenRepo,
  rejectCitizen as rejectCitizenRepo,
} from "../services/CitizenService";

export async function getAllCitizens(req: Request, res: Response) {
  try {
    const user = req.user as { id: string; rtId?: string };
    const result = await getAllCitizensRepo(req.query, user?.rtId);
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

export async function verifyCitizen(req: Request, res: Response) {
  try {
    const { citizenId } = req.params;
    if (!citizenId) {
      return res
        .status(400)
        .json({ success: false, message: "Citizen ID is required" });
    }

    const result = await verifyCitizenRepo(citizenId);
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

export async function rejectCitizen(req: Request, res: Response) {
  try {
    const { citizenId } = req.params;
    if (!citizenId) {
      return res
        .status(400)
        .json({ success: false, message: "Citizen ID is required" });
    }

    const result = await rejectCitizenRepo(citizenId);
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
