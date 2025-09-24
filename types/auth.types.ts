import z from "zod";

// Login request schema
export const loginRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// User schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
});

// Login response schema
export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: userSchema,
});

// Refresh response schema
export const refreshResponseSchema = z.object({
  access_token: z.string(),
});

// Auth state schema
export const authStateSchema = z.object({
  user: userSchema.nullable(),
  accessToken: z.string().nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
});

// Types
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
export type AuthState = z.infer<typeof authStateSchema>;
