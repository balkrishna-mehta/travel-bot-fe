import z from "zod";
import { paginationBase } from "./pagination-base.types";
import { budgetBandSchema } from "./budget-bands.types";
import { managerSchema } from "./managers.types";

export const employeeSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  department: z.string(),
  budget_band_id: z.string(),
  manager_id: z.string(),
  role: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.string(),
  registration: z.string(),
  avatar: z.string(),
  budget_band: budgetBandSchema,
  manager: managerSchema,
});

export const employeeCreateUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  department: z.string().min(1, "Department is required"),
  budget_band_id: z.string().min(1, "Budget band is required"),
  manager_id: z.string().min(1, "Manager is required"),
});

export const employeesResponseSchema = z
  .object({
    users: z.array(employeeSchema),
  })
  .extend(paginationBase.shape);

export interface EmployeeFilters {
  search?: string;
  department?: string;
  registration?: string;
  status?: string;
  manager_id?: string;
  budget_band_id?: string;
  page?: number;
  size?: number;
}

export const employeeKpisSchema = z.object({
  total_employees: z.number(),
  pending_registrations: z.number(),
  active_this_month: z.number(),
  budget_assigned: z.number(),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeesResponse = z.infer<typeof employeesResponseSchema>;
export type EmployeeCreateUpdate = z.infer<typeof employeeCreateUpdateSchema>;
export type EmployeeKpis = z.infer<typeof employeeKpisSchema>;
