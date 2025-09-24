"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export function useUrlFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset page when filters change (except for page and size changes)
      if (key !== "page" && key !== "size") {
        // Only add page=1 to URL if user had explicitly set page before
        if (searchParams.has("page")) {
          params.set("page", "1");
        }
      }

      router.push(`${window.location.pathname}?${params.toString()}`);
    },
    [searchParams, router]
  );

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`${window.location.pathname}?${params.toString()}`);
    },
    [searchParams, router]
  );

  const getParam = useCallback(
    (key: string) => searchParams.get(key) || undefined,
    [searchParams]
  );

  return { setParam, setParams, getParam };
}
