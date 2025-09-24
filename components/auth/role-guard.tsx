"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function RoleGuard({
  children,
  allowedRoles = [],
  redirectTo = "/login",
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to initialize

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // If no specific roles required, allow access
    if (allowedRoles.length === 0) {
      return;
    }

    // Check if user role is allowed
    if (!allowedRoles.includes(user.role)) {
      // Redirect based on user role
      if (user.role === "TicketIssuer") {
        router.push("/ticket-issuer");
      } else {
        router.push("/dashboard");
      }
      return;
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, redirectTo, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or role not allowed
  if (
    !isAuthenticated ||
    !user ||
    (allowedRoles.length > 0 && !allowedRoles.includes(user.role))
  ) {
    return null;
  }

  return <>{children}</>;
}
