import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import passport from "../config/GoogleStrategy";
import { authenticateJWT } from "../middleware/AuthMiddleware";

const router = Router();

//public routes
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
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/logout", AuthController.logout);
router.post("/send-otp", AuthController.sendOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/refresh", AuthController.refresh);
router.post("/forgot-password", AuthController.forgotPassword);
// forgot password in forgot password page
router.put("/forgot-password-change", AuthController.changeForgotPassword);
router.post("/validate-token", AuthController.validateToken);

//protected routes
router.get("/profile", authenticateJWT, AuthController.getProfile);
router.delete("/delete-account", authenticateJWT, AuthController.deleteAccount);
router.put("/update/profile", authenticateJWT, AuthController.updateProfile);
router.put("/change-password", authenticateJWT, AuthController.changePassword);
router.get("/all-users", authenticateJWT, AuthController.getAllUsers);

export default router;
