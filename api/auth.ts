import { apiFetch, ApiResponse } from "@/hooks/use-api";
import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
} from "@/types/auth.types";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return response;
}

export async function refreshToken(): Promise<RefreshResponse> {
  const response = await apiFetch<RefreshResponse>("/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: getRefreshToken() }),
  });

  return response;
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function getCurrentUser(): Promise<{
  user_id: string;
  email: string;
  role: string;
  name: string;
}> {
  const response = await apiFetch<{
    user_id: string;
    email: string;
    role: string;
    name: string;
  }>("/auth/profile", {
    method: "GET",
  });
  return response;
}

// Cookie utilities
export function setRefreshToken(token: string): void {
  if (typeof document !== "undefined") {
    document.cookie = `refresh_token=${token}; path=/; secure; samesite=strict; max-age=${
      30 * 24 * 60 * 60
    }`; // 30 days
  }
}

export function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const refreshTokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("refresh_token=")
  );

  return refreshTokenCookie ? refreshTokenCookie.split("=")[1] : null;
}

export function clearRefreshToken(): void {
  if (typeof document !== "undefined") {
    document.cookie =
      "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}
