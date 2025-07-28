export enum Role {
  CITIZEN = "CITIZEN",
  RT_ADMIN = "RT_ADMIN",
}

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  user: User;
  token: string;
}
