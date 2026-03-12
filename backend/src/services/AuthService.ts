import {
  getUserByEmail as getUserByEmailRepo,
  getUserById,
  createUser,
  getUserByGoogleId,
  updateUserGoogleID,
  changePassword as changePasswordRepo,
  deleteUser,
  updateProfile as updateProfileRepo,
  getAllUsers as getAllUsersRepo,
  getAllRTAdmins as getAllRTAdminsRepo,
  getAllAvailableKecamatan as getAllAvailableKecamatanRepo,
  getAllAvailableKelurahan as getAllAvailableKelurahanRepo,
  getAllAvailableRW as getAllAvailableRWRepo,
  getAllAvailableRT as getAllAvailableRTRepo,
  getAllAvailableRTLocation as getAllAvailableRTLocationRepo,
  getRtLocationBasedOnRtId as getRtLocationBasedOnRtIdRepo,
} from "../repositories/AuthRepository";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../email/EmailForm";
import { getRedisInstance } from "../config/RedisClient";
import otpGenerator from "otp-generator";
import { sendOTPEmail } from "../email/OTP";
import { User } from "@prisma/client";

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function getUserByEmail(email: string) {
  return await getUserByEmailRepo(email);
}

export async function sendOtp(
  email: string,
  password: string,
  name: string,
  phone: string,
  address: string,
  rtId: string,
) {
  const exists = await getUserByEmailRepo(email);
  if (exists) {
    throw new Error("Email sudah terdaftar");
  }

  const redis = getRedisInstance();
  const regId = crypto.randomBytes(32).toString("hex");
  const hashedPassword = await bcrypt.hash(password, 10);
  await redis.set(
    `reg:${regId}`,
    JSON.stringify({
      email,
      hashedPassword,
      name,
      phone,
      address,
      rtId,
      status: "pending",
    }),
    "EX",
    600,
  );

  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  await redis.set(`otp:${regId}`, JSON.stringify({ hashedOtp }), "EX", 300);
  await sendOTPEmail(email, otp, 5);

  return regId;
}

export async function resendOtp(regId: string) {
  const redis = getRedisInstance();
  const payload = await redis.get(`reg:${regId}`);
  if (!payload) {
    throw new Error("Invalid token");
  }
  const payloadJSON = JSON.parse(payload);
  const { email } = payloadJSON;
  const otp = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
  await redis.set(`otp:${regId}`, JSON.stringify({ hashedOtp }), "EX", 300);
  await sendOTPEmail(email, otp, 5);

  return true;
}

export async function register(regId: string, otp: string) {
  const redis = getRedisInstance();
  const [userPayload, otpPayload] = await Promise.all([
    redis.get(`reg:${regId}`),
    redis.get(`otp:${regId}`),
  ]);
  if (!userPayload || !otpPayload) {
    throw new Error("Invalid token");
  }

  const { email, hashedPassword, name, phone, address, rtId } =
    JSON.parse(userPayload);
  const { hashedOtp } = JSON.parse(otpPayload);

  const inputOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (hashedOtp === inputOtp) {
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      phone,
      address,
      rtId,
    });

    const { password: _pw, googleId: _gi, ...safeUser } = user;
    await redis.del(`reg:${regId}`);
    await redis.del(`otp:${regId}`);
    return { user: safeUser };
  } else {
    throw new Error("Invalid OTP");
  }
}

export async function login(
  { email, password }: LoginData,
  rememberMe: boolean,
) {
  const user = await getUserByEmailRepo(email);
  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id, rememberMe);

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
}

export async function handleGoogleAuth(profile: any) {
  const googleId = profile.id;
  const email = profile.emails?.[0]?.value;
  const name = profile.displayName;
  const avatar = profile.photos?.[0]?.value;

  if (!email) {
    throw new Error("No email found in Google profile");
  }

  let user = await getUserByGoogleId(googleId);
  if (!user) {
    user = await getUserByEmailRepo(email);

    if (!user) {
      user = await createUser({
        email,
        name,
        googleId,
        profile: avatar,
      });
    } else {
      user = await updateUserGoogleID(user.id, googleId, avatar);
    }
  }

  if (!user) {
    throw new Error("User not found after Google authentication");
  }

  const accessToken = generateAccessToken(user.id);
  const refreshTokenVal = await generateRefreshToken(user.id);

  return {
    user,
    accessToken,
    refreshToken: refreshTokenVal,
  };
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await getUserById(decoded.userId);
    return user;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

function generateAccessToken(userId: string): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret)
    throw new Error("JWT_SECRET is not defined in environment variables");
  return jwt.sign({ userId }, jwtSecret, { expiresIn: "15m" });
}

async function generateRefreshToken(
  userId: string,
  rememberMe?: boolean,
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  if (rememberMe) {
    await getRedisInstance().set(
      `refresh:${hashedToken}`,
      JSON.stringify({ userId }),
      "EX",
      7 * 24 * 60 * 60 + 300,
    );
  } else {
    await getRedisInstance().set(
      `refresh:${hashedToken}`,
      JSON.stringify({ userId }),
      "EX",
      24 * 60 * 60 + 300,
    );
  }

  return rawToken;
}

export async function refreshToken(cookieRefreshToken: string) {
  const hashedCookieRefreshToken = crypto
    .createHash("sha256")
    .update(cookieRefreshToken)
    .digest("hex");

  const redisRefreshToken = await getRedisInstance().get(
    `refresh:${hashedCookieRefreshToken}`,
  );

  const userId = JSON.parse(redisRefreshToken!).userId;
  const newAccessToken = generateAccessToken(userId);

  return newAccessToken;
}

//untuk forgotpassword
export async function validateToken(token: string, email: string) {
  const user = await getUserByEmailRepo(email);
  if (!user) throw new Error("User not found");
  const userId = user.id;

  const redis = getRedisInstance();
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const savedToken = await redis.get(`reset:${userId}`);

  if (hashedToken !== savedToken) throw new Error("Invalid token");

  return { success: true };
}

export async function changeForgotPassword(email: string, password: string) {
  const user = await getUserByEmailRepo(email);

  if (!user) {
    throw new Error("User not found");
  }

  const userId = user.id;
  const hashedPassword = await bcrypt.hash(password, 10);
  const response = await changePasswordRepo(userId, hashedPassword);

  const redis = getRedisInstance();

  await redis.del(`reset:${userId}`);

  return response;
}

export async function forgotPassword(email: string) {
  const user = await getUserByEmailRepo(email);
  if (!user) {
    throw new Error("User not found");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const redis = getRedisInstance();
  await redis.set(`reset:${user.id}`, hashedToken, "EX", 300);

  const baseUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL;

  const resetPasswordUrl = `${baseUrl}/reset/${rawToken}/${user.email}`;
  await sendPasswordResetEmail(email, resetPasswordUrl, 5);
}

export async function changePassword(userId: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const response = await changePasswordRepo(userId, hashedPassword);

  return response;
}

export async function deleteAccount(userId: string, token: string) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  await deleteUser(userId);

  await getRedisInstance().del(`refresh:${hashedToken}`);

  return true;
}

export async function updateProfile(userId: string, data: User) {
  const current = await getUserById(userId);

  const profileWillBeComplete =
    (data.phone || current?.phone) &&
    (data.address || current?.address) &&
    (data.rtId || current?.rtId);

  if (current?.verificationStatus === "UNVERIFIED" && profileWillBeComplete) {
    (data as any).verificationStatus = "PENDING";
  }

  const user = await updateProfileRepo(userId, data);
  return user;
}

export async function logout(token: string) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  await getRedisInstance().del(`refresh:${hashedToken}`);

  return true;
}

export async function getAllUsers() {
  const users = await getAllUsersRepo();
  return users;
}

export async function getAllRTAdmins(search: string) {
  const users = await getAllRTAdminsRepo(search);
  return users;
}

export async function getAllAvailableKecamatan() {
  const kecamatan = await getAllAvailableKecamatanRepo();
  return kecamatan;
}

export async function getAllAvailableKelurahan(kecamatan: string) {
  const kelurahan = await getAllAvailableKelurahanRepo(kecamatan);
  return kelurahan;
}

export async function getAllAvailableRW(kecamatan: string, kelurahan: string) {
  const rw = await getAllAvailableRWRepo(kecamatan, kelurahan);
  return rw;
}

export async function getAllAvailableRT(
  kecamatan: string,
  kelurahan: string,
  rw: string,
) {
  const rt = await getAllAvailableRTRepo(kecamatan, kelurahan, rw);
  return rt;
}

export async function getAllAvailableRTLocation() {
  const rt = await getAllAvailableRTLocationRepo();
  return rt;
}

export async function getRtLocationBasedOnRtId(rtId: string) {
  const location = await getRtLocationBasedOnRtIdRepo(rtId);
  return location;
}
