import { Router } from "express";
import {
  googleCallback,
  login,
  register,
  logout,
  sendOtp,
  resendOtp,
  refresh,
  forgotPassword,
  changeForgotPassword,
  validateToken,
  getAllAvailableRTLocation,
  getAllRTAdmins,
  getRtLocationBasedOnRtId,
  getProfile,
  deleteAccount,
  updateProfile,
  changePassword,
  getAllUsers,
} from "../controllers/AuthController";
import passport from "../config/GoogleStrategy";
import { authenticateJWT } from "../middleware/AuthMiddleware";

const router = Router();

//public routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback,
);
router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/send-otp", sendOtp);
router.post("/resend-otp", resendOtp);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);

// forgot password in forgot password page
router.put("/forgot-password-change", changeForgotPassword);
router.post("/validate-token", validateToken);
router.get("/all-available-rt", getAllAvailableRTLocation);
router.get("/available-rt", getAllRTAdmins);
router.get("/location/:rt", getRtLocationBasedOnRtId);

//protected routes
router.get("/profile", authenticateJWT, getProfile);
router.delete("/delete-account", authenticateJWT, deleteAccount);
router.put("/update/profile", authenticateJWT, updateProfile);
router.put("/change-password", authenticateJWT, changePassword);
router.get("/all-users", getAllUsers);

export default router;
