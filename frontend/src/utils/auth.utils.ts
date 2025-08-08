import { User, AuthUser } from "../types/auth.types";

// Local storage keys
export const AUTH_STORAGE_KEY = "silapor_auth";
export const USER_STORAGE_KEY = "silapor_user";

// Mock users database (simulate backend)
export const MOCK_USERS = [
  {
    id: "1",
    name: "John Doe",
    email: "citizen@example.com",
    phone: "08123456789",
    password: "password123", // In real app, this would be hashed
    role: "CITIZEN" as const,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Pak RT",
    email: "admin@example.com",
    phone: "08123456788",
    password: "admin123",
    role: "RT_ADMIN" as const,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi@example.com",
    phone: "08123456787",
    password: "budi123",
    role: "CITIZEN" as const,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

// Generate mock JWT token
export const generateMockToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    })
  );
  const signature = "mock_signature";
  return `${header}.${payload}.${signature}`;
};

// Validate mock JWT token
export const validateMockToken = (token: string): boolean => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now;
  } catch {
    return false;
  }
};

// Get user ID from token
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch {
    return null;
  }
};

// Local storage helpers
export const saveAuthData = (authData: AuthUser): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, authData.token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authData.user));
};

export const getAuthData = (): AuthUser | null => {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    const userJson = localStorage.getItem(USER_STORAGE_KEY);

    if (!token || !userJson) return null;

    // Validate token
    if (!validateMockToken(token)) {
      clearAuthData();
      return null;
    }

    const user = JSON.parse(userJson) as User;
    return { user, token };
  } catch {
    clearAuthData();
    return null;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};
