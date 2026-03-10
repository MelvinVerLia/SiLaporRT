export enum Role {
  CITIZEN = "CITIZEN",
  RT_ADMIN = "RT_ADMIN",
}

export enum VerificationStatus {
  UNVERIFIED = "UNVERIFIED",
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export interface User {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  role?: Role;
  rtId?: string;
  address: string;
  isActive?: boolean;
  verificationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  profile?: string;
  isDeleted?: boolean;
}

export interface AuthUser {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface RT {
  name: string;
  rtId: string;
}
