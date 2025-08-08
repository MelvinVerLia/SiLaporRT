import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import { AuthRepository } from "../repositories/AuthRepository";
import { AuthService } from "../services/AuthService";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/api/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const result = await AuthService.handleGoogleAuth(profile);
        return done(null, result);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

// JWT Strategy for protecting routes
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string,
    },
    async (payload, done) => {
      try {
        const user = await AuthRepository.getUserById(payload.userId);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export default passport;
