import { apiFetch, ApiResponse } from "@/hooks/use-api";
import {
  BudgetBand,
  BudgetBandCreateUpdate,
  BudgetBandsResponse,
  BudgetBandsKpis,
} from "@/types/budget-bands.types";
import { Status } from "@/types/status.types";

export async function fetchBudgetBands(): Promise<BudgetBandsResponse> {
  const response = await apiFetch<ApiResponse<BudgetBandsResponse>>(
    "/budget-bands"
  );

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch budget bands");
  }

  return response.value;
}

export async function createBudgetBand(
  budgetBand: BudgetBandCreateUpdate
): Promise<ApiResponse<BudgetBand>> {
  const response = await apiFetch<ApiResponse<BudgetBand>>("/budget-bands/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budgetBand),
  });

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to create budget band");
  }

  return response;
}

export async function updateBudgetBand(
  id: number,
  budgetBand: BudgetBandCreateUpdate
): Promise<ApiResponse<BudgetBand>> {
  const response = await apiFetch<ApiResponse<BudgetBand>>(
    `/budget-bands/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(budgetBand),
    }
  );

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to update budget band");
  }

  return response;
}

export async function toggleBudgetBandStatus(
  id: number,
  status: Status
): Promise<ApiResponse<BudgetBand>> {
  const response = await apiFetch<ApiResponse<BudgetBand>>(
    `/budget-bands/${id}/status?status=${status}`,
    {
      method: "PATCH",
    }
  );

  if (!response.success) {
    throw new Error(
      response.errorMessage || "Failed to update budget band status"
    );
  }

  return response;
}

export async function fetchBudgetBandsKpis(): Promise<BudgetBandsKpis> {
  const response = await apiFetch<ApiResponse<BudgetBandsKpis>>(
    "/budget-bands/kpis"
  );

  if (!response.success) {
    throw new Error(
      response.errorMessage || "Failed to fetch budget bands KPIs"
    );
  }

  return response.value;
}
