import { AppError } from "@/errors/app.error";

/**
 * Ensure that a MongoDB document exists.
 * If not, throw a 404 AppError.
 *
 * @template T - Document type
 * @param repository - Repository instance with a findById method
 * @param id - Document ID to find
 * @param message - Custom error message (default: "Not found")
 * @returns The existing document if found
 * @throws AppError(404) if document is not found
 */

export async function getOrThrowById<T>(
  repository: { findById: (id: string) => Promise<T | null> },
  id: string,
  message = "Not found",
  code = 404
): Promise<T> {
  const doc = await repository.findById(id);
  if (!doc) throw new AppError(message, code);
  return doc;
}
