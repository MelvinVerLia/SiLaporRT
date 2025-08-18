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
router.post("/validate-token", AuthController.validateToken)
router.put("/change-password", AuthController.changePassword)

router.get("/profile", authenticateJWT, AuthController.getProfile);

router.post("/send-otp", AuthController.sendOtp);
// router.post("/validate-otp-token", AuthController.validateOtpToken);

export default router;
