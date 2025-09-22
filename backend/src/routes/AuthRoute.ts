import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import passport from "../config/GoogleStrategy";
import { authenticateJWT } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/logout", AuthController.logout);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  AuthController.googleCallback
);

router.post("/forgot-password", AuthController.forgotPassword);
router.post("/validate-token", AuthController.validateToken);
router.put("/change-password", authenticateJWT, AuthController.changePassword);

router.get("/profile", authenticateJWT, AuthController.getProfile);

router.post("/send-otp", AuthController.sendOtp);
router.post("/resend-otp", AuthController.resendOtp);

router.delete("/delete-account", authenticateJWT, AuthController.deleteAccount);

router.put("/update/profile", authenticateJWT, AuthController.updateProfile);

export default router;
