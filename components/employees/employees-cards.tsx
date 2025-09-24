"use client";
import React from "react";
import { SectionCards } from "@/components/common/section-cards";
import { useQuery } from "@tanstack/react-query";
import { formatPercent } from "@/lib/utils";
import { fetchEmployeeKpis } from "@/api/employees";

export function EmployeesCards() {
  const { data: employeeKpis } = useQuery({
    queryKey: ["employeeKpis"],
    queryFn: () => fetchEmployeeKpis(),
  });

  const totalEmployees = employeeKpis?.total_employees || 0;
  const activeThisMonth = employeeKpis?.active_this_month || 0;
  const activePct = totalEmployees
    ? (activeThisMonth / totalEmployees) * 100
    : 0;

  const sectionCardsData = [
    {
      title: "Total Employees",
      value: employeeKpis?.total_employees.toString() || "0",
      description: "Active employees in the system",
      icon: "👥",
    },
    {
      title: "Pending Registrations",
      value: employeeKpis?.pending_registrations.toString() || "0",
      description: "Requiring approval",
      icon: "⏱️",
    },
    {
      title: "Active This Month",
      value: employeeKpis?.active_this_month.toString() || "0",
      description: `${formatPercent(activePct)}% of total employees`,
      icon: "",
    },
    {
      title: "Budget Assigned",
      value: formatPercent(employeeKpis?.budget_assigned || 0) || "0",
      description: `${formatPercent(
        100 - (employeeKpis?.budget_assigned || 0)
      )}% pending assignment`,
      icon: "💰",
    },
  ];
  return <SectionCards data={sectionCardsData} />;
}
