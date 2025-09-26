import { useAppSelector } from "@/lib/hooks";

/**
 * Simple hook to check if auth is ready for API calls
 */
export function useAuthLoading() {
  const { isLoading } = useAppSelector((state) => state.auth);

  return {
    isAuthReady: !isLoading, // Only make API calls when auth initialization is complete
  };
}
