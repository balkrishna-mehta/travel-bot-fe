import { z } from "zod";

// KPI data structure for each metric
const kpiDataSchema = z.object({
  current: z.number(),
  previous: z.number(),
});

// Dashboard KPIs schema
export const dashboardKpisSchema = z.object({
  total_employees: kpiDataSchema,
  travel_requests: kpiDataSchema,
  total_spending: kpiDataSchema,
  pending_approvals: kpiDataSchema,
});

export type KpiData = z.infer<typeof kpiDataSchema>;
export type DashboardKpis = z.infer<typeof dashboardKpisSchema>;
