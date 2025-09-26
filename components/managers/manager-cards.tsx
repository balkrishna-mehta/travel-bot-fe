"use client";
import React from "react";
import { SectionCards } from "@/components/common/section-cards";
import { useQuery } from "@tanstack/react-query";
import { formatPercent } from "@/lib/utils";
import { fetchManagerKpis } from "@/api/managers";
import { useAuthLoading } from "@/hooks/use-auth-loading";

export function ManagerCards() {
  const { isAuthReady } = useAuthLoading();

  const { data: managerKpis } = useQuery({
    queryKey: ["managerKpis"],
    queryFn: () => fetchManagerKpis(),
    enabled: isAuthReady, // Only fetch when auth initialization is complete
  });

  const totalManagers = managerKpis?.total_managers || 0;
  const activeManagers = managerKpis?.active_managers || 0;
  const activePct = totalManagers ? (activeManagers / totalManagers) * 100 : 0;

  const sectionCardsData = [
    {
      title: "Total Managers",
      value: managerKpis?.total_managers.toString() || "0",
      description: "Active managers in the system",
      icon: "👥",
    },
    {
      title: "Active Managers",
      value: managerKpis?.active_managers.toString() || "0",
      description: `${formatPercent(activePct)}% of total managers`,
      icon: "✅",
    },
    {
      title: "Employees Managed",
      value: managerKpis?.employees_managed.toString() || "0",
      description: "Total team members under management",
      icon: "👤",
    },
    {
      title: "Avg Team Size",
      value: managerKpis?.avg_team_size.toString() || "0",
      description: "Average members per manager",
      icon: "📊",
    },
  ];
  return <SectionCards data={sectionCardsData} />;
}
