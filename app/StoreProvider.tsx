"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { useAppDispatch } from "@/lib/hooks";
import { initializeAuth } from "@/lib/features/auth/authSlice";
import { setStoreReference } from "@/hooks/use-api";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  // const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Don't block the UI - let components handle their own loading states
  // The API layer will handle token refresh automatically
  return <>{children}</>;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Set store reference for API calls
  useEffect(() => {
    setStoreReference(store);
  }, []);

  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
