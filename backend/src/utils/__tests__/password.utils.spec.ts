import { hashPassword, verifyPassword } from "@/utils/password.utils";
import { AppError } from "@/errors/app.error";

/**
 * Unit tests for password utility functions (hashPassword, verifyPassword).
 * Ensures both normal and edge/error cases are handled.
 */
describe("Password Utils", () => {
  it("should hash and verify a password correctly", async () => {
    const plain = "mySecretPassword!";

    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);

    const isMatch = await verifyPassword(plain, hash);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword("wrongPassword", hash);
    expect(isWrong).toBe(false);
  });

  it("should throw AppError if hash is invalid (verifyPassword)", async () => {
    await expect(verifyPassword("test", "invalidHash")).rejects.toThrow(
      AppError
    );
  });

  it("should throw AppError if hashing fails (hashPassword)", async () => {
    // @ts-expect-error: this is intentional for edge case testing
    await expect(hashPassword(null)).rejects.toThrow(AppError);
  });
});
