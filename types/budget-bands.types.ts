import z from "zod";
import { paginationBase } from "./pagination-base.types";

export const budgetBandSchema = z.object({
  id: z.number(),
  name: z.string(),
  target: z.string(),
  flight_limit: z.number(),
  train_limit: z.number(),
  hotel_limit: z.number(),
  employee_count: z.number(),
  status: z.enum(["Active", "Inactive"]),
});

export const budgetBandCreateUpdateSchema = z.object({
  name: z.string(),
  target: z.string(),
  flight_limit: z.number(),
  train_limit: z.number(),
  hotel_limit: z.number(),
});

export const budgetBandsResponseSchema = z
  .object({
    budget_bands: z.array(budgetBandSchema),
  })
  .extend(paginationBase.shape);

export const budgetBandsKpisSchema = z.object({
  total_budget_bands: z.number(),
  active_budget_bands: z.number(),
  employees_covered: z.number(),
  average_travel_limit: z.number(),
});

export type BudgetBand = z.infer<typeof budgetBandSchema>;
export type BudgetBandsResponse = z.infer<typeof budgetBandsResponseSchema>;
export type BudgetBandCreateUpdate = z.infer<
  typeof budgetBandCreateUpdateSchema
>;
export type BudgetBandsKpis = z.infer<typeof budgetBandsKpisSchema>;
