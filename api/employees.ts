import { apiFetch, ApiResponse } from "@/hooks/use-api";
import {
  Employee,
  EmployeesResponse,
  EmployeeCreateUpdate,
  EmployeeFilters,
  EmployeeKpis,
} from "@/types/employees.types";
import { Status } from "@/types/status.types";

export async function fetchEmployees(
  filters?: EmployeeFilters
): Promise<EmployeesResponse> {
  let endpoint = "/users/by-role/Employee";

  if (filters) {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.department) params.append("department", filters.department);
    if (filters.registration)
      params.append("registration", filters.registration);
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

  const response = await apiFetch<ApiResponse<EmployeesResponse>>(endpoint);

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch employees");
  }

  return response.value;
}

export async function updateEmployee(
  id: number,
  employee: EmployeeCreateUpdate
): Promise<ApiResponse<Employee>> {
  const response = await apiFetch<ApiResponse<Employee>>(`/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(employee),
  });

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to update employee");
  }

  return response;
}

export async function toggleEmployeeStatus(
  id: number,
  status: Status
): Promise<ApiResponse<Employee>> {
  const response = await apiFetch<ApiResponse<Employee>>(
    `/users/${id}/status?status=${status}`,
    {
      method: "PATCH",
    }
  );

  if (!response.success) {
    throw new Error(
      response.errorMessage || "Failed to update employee status"
    );
  }

  return response;
}

export async function fetchEmployeeKpis(): Promise<EmployeeKpis> {
  const response = await apiFetch<ApiResponse<EmployeeKpis>>(
    "/users/employees/kpis"
  );

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch employee KPIs");
  }

  return response.value;
}
