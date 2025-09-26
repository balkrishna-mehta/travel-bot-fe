"use client";
import React from "react";
import { SectionCards } from "@/components/common/section-cards";
import { useQuery } from "@tanstack/react-query";
import { formatPercent } from "@/lib/utils";
import { fetchDashboardKpis } from "@/api/dashboard";
import { Users } from "lucide-react";
import { useAuthLoading } from "@/hooks/use-auth-loading";

export function DashboardCards() {
  const { isAuthReady } = useAuthLoading();

  const { data: dashboardKpis } = useQuery({
    queryKey: ["dashboardKpis"],
    queryFn: () => fetchDashboardKpis(),
    enabled: isAuthReady, // Only fetch when auth initialization is complete
  });

  const currentEmployees = dashboardKpis?.total_employees.current || 0;
  const previousEmployees = dashboardKpis?.total_employees.previous || 0;
  const employeesChangePercentage =
    previousEmployees === 0
      ? currentEmployees > 0
        ? 100
        : 0
      : ((currentEmployees - previousEmployees) / previousEmployees) * 100;

  const currentTravelRequests = dashboardKpis?.travel_requests.current || 0;
  const previousTravelRequests = dashboardKpis?.travel_requests.previous || 0;
  const travelRequestsChangePercentage =
    previousTravelRequests === 0
      ? currentTravelRequests > 0
        ? 100
        : 0
      : ((currentTravelRequests - previousTravelRequests) /
          previousTravelRequests) *
        100;

  const currentSpending = dashboardKpis?.total_spending.current || 0;
  const previousSpending = dashboardKpis?.total_spending.previous || 0;
  const spendingChangePercentage =
    previousSpending === 0
      ? currentSpending > 0
        ? 100
        : 0
      : ((currentSpending - previousSpending) / previousSpending) * 100;

  const currentPendingApprovals = dashboardKpis?.pending_approvals.current || 0;
  const previousPendingApprovals =
    dashboardKpis?.pending_approvals.previous || 0;
  const pendingApprovalsChangePercentage =
    previousPendingApprovals === 0
      ? currentPendingApprovals > 0
        ? 100
        : 0
      : ((currentPendingApprovals - previousPendingApprovals) /
          previousPendingApprovals) *
        100;

  const sectionCardsData = [
    {
      title: "Total Employees",
      subtitle: (
        <p className="text-sm text-muted-foreground">
          <span
            className={
              employeesChangePercentage <= 0 ? "text-red-500" : "text-green-500"
            }
          >
            {formatPercent(employeesChangePercentage)}%{" "}
          </span>
          from last month
        </p>
      ),
      value: currentEmployees.toString(),
      description: "Active employees in the system",
      icon: <Users className="h-4 w-4 text-gray-500" />,
    },
    {
      title: "Travel Requests",
      subtitle: (
        <p className="text-sm text-muted-foreground">
          <span
            className={
              travelRequestsChangePercentage <= 0
                ? "text-red-500"
                : "text-green-500"
            }
          >
            {formatPercent(travelRequestsChangePercentage)}%{" "}
          </span>
          from last month
        </p>
      ),
      value: currentTravelRequests.toString(),
      description: "Pending travel requests this month",
      icon: "✈️",
    },
    {
      title: "Total spending",
      subtitle: (
        <p className="text-sm text-muted-foreground">
          <span
            className={
              spendingChangePercentage <= 0 ? "text-red-500" : "text-green-500"
            }
          >
            {formatPercent(spendingChangePercentage)}%{" "}
          </span>
          from last month
        </p>
      ),
      value: `$${currentSpending.toString()}`,
      description: "Total spending this month",
      icon: "💰",
    },
    {
      title: "Pending Approvals",
      subtitle: (
        <p className="text-sm text-muted-foreground">
          <span
            className={
              pendingApprovalsChangePercentage <= 0
                ? "text-red-500"
                : "text-green-500"
            }
          >
            {formatPercent(pendingApprovalsChangePercentage)}%{" "}
          </span>
          from last month
        </p>
      ),
      value: currentPendingApprovals.toString(),
      description: "Travel requests awaiting manager approval",
      icon: "⏱️",
    },
  ];
  return <SectionCards data={sectionCardsData} />;
}
