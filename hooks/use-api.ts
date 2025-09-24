const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ApiResponse<T = any> {
  value: T;
  success: boolean;
  statusCode: number;
  resultMessage: string;
  errorMessage: string | null;
  exceptionMessage: string | null;
}

// Store reference to store for token access
let store: any = null;

export function setStoreReference(storeRef: any) {
  store = storeRef;
}

// Get access token from Redux store
function getAccessToken(): string | null {
  if (typeof window === "undefined" || !store) return null;
  const state = store.getState();
  return state.auth?.accessToken || null;
}

// Generic API fetch function with automatic token refresh
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  retryCount = 0
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {};

  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Add authorization header if access token exists
  const accessToken = getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && retryCount === 0 && store) {
    try {
      // Dispatch refresh token action
      const { refreshUserToken } = await import(
        "@/lib/features/auth/authSlice"
      );
      const refreshResult = await store.dispatch(refreshUserToken());

      if (refreshUserToken.fulfilled.match(refreshResult)) {
        // Retry the original request with new token
        return apiFetch<T>(endpoint, options, retryCount + 1);
      } else {
        // Refresh failed, redirect to login
        const { clearAuth } = await import("@/lib/features/auth/authSlice");
        store.dispatch(clearAuth());
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Refresh failed, redirect to login
      const { clearAuth } = await import("@/lib/features/auth/authSlice");
      store.dispatch(clearAuth());
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  const data = await response.json();
  console.log("API Response:", data);
  return data;
}
