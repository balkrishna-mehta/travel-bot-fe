"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { User, AuthState } from "@/types/auth.types";
import {
  login as loginApi,
  refreshToken,
  logout as logoutApi,
  setRefreshToken,
  getRefreshToken,
  clearRefreshToken,
} from "@/api/auth";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!accessToken;

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = accessToken;
        const refreshTokenValue = getRefreshToken();

        if (storedToken && refreshTokenValue) {
          // Try to refresh the token to get fresh user data
          await refreshAuthToken();
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessTokenState(null);
    clearRefreshToken();
  }, []);

  const refreshAuthToken = useCallback(async () => {
    try {
      const response = await refreshToken();
      setAccessTokenState(response.access_token);
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearAuth();
      router.push("/login");
    }
  }, [clearAuth, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        const response = await loginApi({ email, password });

        // Store tokens
        setRefreshToken(response.refresh_token);

        // Update state
        setUser(response.user);
        setAccessTokenState(response.access_token);

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      clearAuth();
      router.push("/login");
    }
  }, [clearAuth, router]);

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
