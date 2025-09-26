"use client";

import { useAppSelector } from "@/lib/hooks";

interface AuthAwareWrapperProps {
  children: React.ReactNode;
}

/**
 * Simple wrapper that shows nothing during auth initialization
 */
export function AuthAwareWrapper({ children }: AuthAwareWrapperProps) {
  const { isLoading, isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );

  // Show nothing during auth initialization
  if (isLoading && !isAuthenticated && !user) {
    return null;
  }

  return <>{children}</>;
}
