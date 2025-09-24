import z from "zod";
import { paginationBase } from "./pagination-base.types";

// Enums
export const SessionStatus = z.enum([
  "NewRequest",
  "InUserSelection",
  "UserUpdateRequest",
  "UserRejected",
  "InManagerReview",
  "ManagerApproved",
  "ManagerRejected",
  "ManagerUpdateRequest",
  "Completed",
]);

export const SessionState = z.enum(["Processing", "Failed", "Success"]);

export const BookingStatus = z.enum(["Active", "Inactive"]);

// User Schema
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  department: z.string(),
  budget_band_id: z.string().uuid(),
  manager_id: z.string().uuid(),
  role: z.string(),
  registration: z.string(),
  status: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Session Schema
const sessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  state: SessionState,
  status: SessionStatus,
  completed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Travel Request/Booking Schema
export const travelRequestSchema = z.object({
  id: z.string().uuid(),
  purpose: z.string().optional(),
  user_id: z.string().uuid(),
  session_id: z.string().uuid(),
  version: z.number().default(1),
  destination: z.string(),
  departure_date: z.string().datetime(),
  return_date: z.string().datetime(),

  onward_options: z.array(z.record(z.string(), z.unknown())),
  return_options: z.array(z.record(z.string(), z.unknown())),
  hotel_options: z.array(z.record(z.string(), z.unknown())),

  selected_onward_index: z.number().nullable(),
  selected_return_index: z.number().nullable(),
  selected_hotel_index: z.number().nullable(),

  status: BookingStatus,
  inactive_reason: z.string().nullable().optional(),
  manager_feedback: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user: userSchema.optional(),
  session: sessionSchema.optional(),
});

// Session Response Schema
export const sessionResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  state: SessionState,
  status: SessionStatus,
  completed_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user: userSchema.optional(),
});

// Request/Response Schemas
export const travelRequestsResponseSchema = z
  .object({
    travel_requests: z.array(travelRequestSchema),
  })
  .extend(paginationBase.shape);

// Booking Create Schema
export const bookingCreateSchema = z.object({
  user_id: z.string().uuid(),
  session_id: z.string().uuid(),
  purpose: z.string().optional(),
  destination: z.string(),
  departure_date: z.string().datetime(),
  return_date: z.string().datetime(),
  onward_options: z.array(z.record(z.string(), z.unknown())),
  return_options: z.array(z.record(z.string(), z.unknown())),
  hotel_options: z.array(z.record(z.string(), z.unknown())),
  selected_onward_index: z.number().nullable().optional(),
  selected_return_index: z.number().nullable().optional(),
  selected_hotel_index: z.number().nullable().optional(),
  version: z.number().default(1),
});

// Booking Update Schema
export const bookingUpdateSchema = z.object({
  purpose: z.string().optional(),
  destination: z.string().optional(),
  departure_date: z.string().datetime().optional(),
  return_date: z.string().datetime().optional(),
  onward_options: z.array(z.record(z.string(), z.unknown())).optional(),
  return_options: z.array(z.record(z.string(), z.unknown())).optional(),
  hotel_options: z.array(z.record(z.string(), z.unknown())).optional(),
  selected_onward_index: z.number().nullable().optional(),
  selected_return_index: z.number().nullable().optional(),
  selected_hotel_index: z.number().nullable().optional(),
  status: BookingStatus.optional(),
  inactive_reason: z.string().nullable().optional(),
  manager_feedback: z.string().nullable().optional(),
  version: z.number().optional(),
});

// Selection Update Schema
export const selectionUpdateSchema = z.object({
  selected_onward_index: z.number().nullable().optional(),
  selected_return_index: z.number().nullable().optional(),
  selected_hotel_index: z.number().nullable().optional(),
});

// Manager Review Schema
export const managerReviewSchema = z.object({
  session_id: z.string().uuid(),
  booking_id: z.string().uuid(),
  action: SessionStatus,
  feedback: z.string().min(1).max(200),
});

export const travelRequestsKpisSchema = z.object({
  total_requests: z.number(),
  pending_approval: z.number(),
  approved_today: z.number(),
  completed_bookings: z.number(),
});

// Type Exports
export type TravelRequest = z.infer<typeof travelRequestSchema>;
export type TravelRequestsResponse = z.infer<
  typeof travelRequestsResponseSchema
>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type BookingCreate = z.infer<typeof bookingCreateSchema>;
export type BookingUpdate = z.infer<typeof bookingUpdateSchema>;
export type SelectionUpdate = z.infer<typeof selectionUpdateSchema>;
export type ManagerReview = z.infer<typeof managerReviewSchema>;
export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type TravelRequestsKpis = z.infer<typeof travelRequestsKpisSchema>;
