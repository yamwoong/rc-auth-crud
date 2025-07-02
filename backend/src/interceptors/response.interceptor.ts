import { Interceptor, InterceptorInterface, Action } from "routing-controllers";

/**
 * Interceptor to wrap all controller responses in a consistent API format.
 * All API responses will be automatically transformed to: { data, message }
 * This improves frontend integration and makes API contracts predictable.
 */
@Interceptor()
export class ResponseWrapperInterceptor implements InterceptorInterface {
  /**
   * Intercepts the controller's return value and wraps it in a standard structure.
   * @param action - The current controller action context.
   * @param result - The value returned from the controller action.
   * @returns Wrapped API response { data, message }
   */
  intercept(
    action: Action,
    result: unknown
  ): { data: unknown; message: string; code: number } {
    if (typeof result === "object" && result !== null && "data" in result) {
      return result as { data: unknown; message: string; code: number };
    }
    return {
      data: result,
      message: "success",
      code: 200, // Optiona
    };
  }
}
