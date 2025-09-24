import { z } from "zod";
import { paginationBase } from "./pagination-base.types";

export const managerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  department: z.string(),
  team_size: z.number(),
  status: z.enum(["Active", "Inactive"]),
  avatar: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const managerCreateUpdateSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  department: z.string(),
  password: z.string(),
});

export const managersResponseSchema = z
  .object({
    users: z.array(managerSchema),
  })
  .extend(paginationBase.shape);

export interface ManagerFilters {
  search?: string;
  department?: string;
  status?: string;
  manager_id?: string;
  budget_band_id?: string;
  page?: number;
  size?: number;
}

export const managerKpisSchema = z.object({
  total_managers: z.number(),
  active_managers: z.number(),
  employees_managed: z.number(),
  avg_team_size: z.number(),
});

export type Manager = z.infer<typeof managerSchema>;
export type ManagerCreateUpdate = z.infer<typeof managerCreateUpdateSchema>;
export type ManagersResponse = z.infer<typeof managersResponseSchema>;
export type ManagerKpis = z.infer<typeof managerKpisSchema>;
