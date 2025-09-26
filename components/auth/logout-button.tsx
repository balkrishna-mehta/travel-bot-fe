"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logoutUser } from "@/lib/features/auth/authSlice";
import { IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  withText?: boolean;
}

export function LogoutButton({
  variant = "default",
  size = "default",
  withText = true,
  className,
}: LogoutButtonProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      <IconLogout className="h-4 w-4" />
      {withText && (isLoading ? "Logging out..." : "Logout")}
    </Button>
  );
}
