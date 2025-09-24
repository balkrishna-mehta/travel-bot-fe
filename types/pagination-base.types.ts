import { z } from "zod";

export const paginationBase = z.object({
  total: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type PaginationBase = z.infer<typeof paginationBase>;
