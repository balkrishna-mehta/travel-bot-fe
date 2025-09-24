"use client";
import React from "react";
import { SectionCards } from "@/components/common/section-cards";
import { useQuery } from "@tanstack/react-query";
import { formatPercent } from "@/lib/utils";
import { fetchBudgetBandsKpis } from "@/api/budget-bands";

export function BudgetBandsCards() {
  const { data: budgetBandsKpis } = useQuery({
    queryKey: ["budgetBandsKpis"],
    queryFn: () => fetchBudgetBandsKpis(),
  });

  const totalBands = budgetBandsKpis?.total_budget_bands || 0;
  const activeBands = budgetBandsKpis?.active_budget_bands || 0;
  const activePct = totalBands ? (activeBands / totalBands) * 100 : 0;

  const sectionCardsData = [
    {
      title: "Total Bands",
      value: budgetBandsKpis?.total_budget_bands.toString() || "0",
      description: "Budget bands configured",
      icon: "📊",
    },
    {
      title: "Active Bands",
      value: budgetBandsKpis?.active_budget_bands.toString() || "0",
      description: `${formatPercent(activePct)}% of total bands`,
      icon: "✅",
    },
    {
      title: "Employees Covered",
      value: budgetBandsKpis?.employees_covered.toString() || "0",
      description: "Total employees assigned to bands",
      icon: "👥",
    },
    {
      title: "Avg Travel Limit",
      value: budgetBandsKpis?.average_travel_limit.toString() || "0",
      description: "Average travel limit across bands",
      icon: "💰",
    },
  ];
  return <SectionCards data={sectionCardsData} />;
}
