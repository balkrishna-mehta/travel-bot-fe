import z from "zod";

// Employee details schema
export const employeeDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string(),
  department: z.string().optional(),
  role: z.string(),
  status: z.string(),
});

// Booking details schema
export const bookingDetailsSchema = z.object({
  id: z.string(),
  purpose: z.string().optional(),
  destination: z.string(),
  departure_date: z.string(),
  return_date: z.string(),
  status: z.string(),
  version: z.number(),
});

// Base invoice schema matching backend
export const invoiceSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  booking_id: z.string().optional(),
  session_id: z.string().optional(),
  category: z.enum(["Flight", "Hotel", "Train"]),
  amount: z.number(),
  file_path: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Invoice with details schema
export const invoiceWithDetailsSchema = invoiceSchema.extend({
  employee: employeeDetailsSchema.optional(),
  booking: bookingDetailsSchema.optional(),
});

// Response schema for paginated invoices
export const invoicesResponseSchema = z.object({
  invoices: z.array(invoiceWithDetailsSchema),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  pages: z.number(),
});

export const invoicesKpisSchema = z.object({
  total_invoices: z.number(),
  total_amount: z.number(),
  flight_expenses: z.number(),
  avg_invoice: z.number(),
});

// Types
export type EmployeeDetails = z.infer<typeof employeeDetailsSchema>;
export type BookingDetails = z.infer<typeof bookingDetailsSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceWithDetails = z.infer<typeof invoiceWithDetailsSchema>;
export type InvoicesResponse = z.infer<typeof invoicesResponseSchema>;
export type InvoicesKpis = z.infer<typeof invoicesKpisSchema>;
