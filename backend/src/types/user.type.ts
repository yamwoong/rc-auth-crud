/**
 * @interface User
 * Business layer user type for API, services, and DTOs.
 * - Maps MongoDB _id to id (string)
 * - Excludes sensitive fields (e.g. password)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  provider: "local" | "google";
  googleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
