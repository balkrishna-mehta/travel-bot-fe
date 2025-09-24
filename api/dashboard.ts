import { apiFetch, ApiResponse } from "@/hooks/use-api";
import { DashboardKpis } from "@/types/dashboard.types";

export interface ChartDataPoint {
  date: string;
  total: number;
  pending: number;
}

export async function fetchDashboardKpis(): Promise<DashboardKpis> {
  const response = await apiFetch<ApiResponse<DashboardKpis>>(
    "/dashboard/kpis"
  );

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch dashboard KPIs");
  }

  return response.value;
}

export async function fetchChartData(
  timeRange: string = "90d"
): Promise<ChartDataPoint[]> {
  const response = await apiFetch<ApiResponse<ChartDataPoint[]>>(
    `/dashboard/chart-data?time_range=${timeRange}`
  );

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch chart data");
  }

  return response.value;
}
