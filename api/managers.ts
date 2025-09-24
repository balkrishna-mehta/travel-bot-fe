import { apiFetch, ApiResponse } from "@/hooks/use-api";
import {
  ManagersResponse,
  ManagerCreateUpdate,
  Manager,
  ManagerFilters,
  ManagerKpis,
} from "@/types/managers.types";
import { Status } from "@/types/status.types";

export async function fetchManagers(
  filters?: ManagerFilters
): Promise<ManagersResponse> {
  let endpoint = "/users/by-role/Manager";

  if (filters) {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.department) params.append("department", filters.department);
    if (filters.status) params.append("status", filters.status);
    if (filters.manager_id) params.append("manager_id", filters.manager_id);
    if (filters.budget_band_id)
      params.append("budget_band_id", filters.budget_band_id);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.size) params.append("size", filters.size.toString());

    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
  }

  const response = await apiFetch<ApiResponse<ManagersResponse>>(endpoint);

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch managers");
  }

  return response.value;
}

export async function createManager(
  manager: ManagerCreateUpdate
): Promise<ApiResponse<Manager>> {
  const response = await apiFetch<ApiResponse<Manager>>("/users/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...manager,
      role: "Manager", // Ensure the role is set to Manager
    }),
  });

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to create manager");
  }

  return response;
}

export async function updateManager(
  id: number,
  manager: ManagerCreateUpdate
): Promise<ApiResponse<Manager>> {
  const response = await apiFetch<ApiResponse<Manager>>(`/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(manager),
  });

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to update manager");
  }

  return response;
}

export async function toggleManagerStatus(
  id: number,
  status: Status
): Promise<ApiResponse<Manager>> {
  const response = await apiFetch<ApiResponse<Manager>>(
    `/users/${id}/status?status=${status}`,
    {
      method: "PATCH",
    }
  );

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to update manager status");
  }

  return response;
}

export async function fetchManagerKpis(): Promise<ManagerKpis> {
  const response = await apiFetch<ApiResponse<ManagerKpis>>(
    "/users/managers/kpis"
  );

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch manager KPIs");
  }

  return response.value;
}
