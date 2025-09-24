import { Badge } from "@/components/ui/badge";

export interface StatusConfig {
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
}

export interface StatusBadgeProps {
  status: string;
  statusConfigs: Record<string, StatusConfig>;
}

export function StatusBadge({ status, statusConfigs }: StatusBadgeProps) {
  const config = statusConfigs[status];

  if (!config) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}

// Common status configurations
export const commonStatusConfigs = {
  active: {
    variant: "default" as const,
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  inactive: {
    variant: "secondary" as const,
    className: "bg-gray-500 text-white hover:bg-gray-600",
  },
  pending: {
    variant: "secondary" as const,
    className: "bg-yellow-500 text-white hover:bg-yellow-600",
  },
  approved: {
    variant: "default" as const,
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  rejected: {
    variant: "destructive" as const,
    className: "bg-red-600 text-white hover:bg-red-700",
  },
  paid: {
    variant: "default" as const,
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  completed: {
    variant: "default" as const,
    className: "bg-blue-600 text-white hover:bg-blue-700",
  },
};
