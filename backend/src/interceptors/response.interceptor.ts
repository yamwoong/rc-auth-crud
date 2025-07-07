import { Interceptor, InterceptorInterface, Action } from "routing-controllers";
import { Service } from "typedi";

/**
 * Interceptor to wrap all controller responses in a consistent API format.
 * All API responses will be automatically transformed to: { data, message, code }
 * This improves frontend integration and makes API contracts predictable.
 */
@Interceptor()
@Service()
export class ResponseWrapperInterceptor implements InterceptorInterface {
  /**
   * Intercepts the controller's return value and wraps it in a standard structure.
   * @param action - The current controller action context.
   * @param result - The value returned from the controller action.
   * @returns Wrapped API response { data, message, code }
   */
  intercept(
    _action: Action,
    result: unknown
  ): { data: unknown; message: string; code: number } | undefined {
    if (result === undefined) {
      return undefined;
    }
    if (
      typeof result === "object" &&
      result !== null &&
      "data" in result &&
      "message" in result &&
      "code" in result
    ) {
      return result as { data: unknown; message: string; code: number };
    }
    return {
      data: result,
      message: "success",
      code: 200,
    };
  }
}
