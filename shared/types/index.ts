// Shared application types used across frontend, backend, and shared layers.
// Prisma-generated types (User, Item, Task, etc.) are imported directly from @prisma/client.

// Standard API response shape for all route handlers
export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }
