import { JsonController, Get } from "routing-controllers";

/**
 * Controller for API health check endpoint.
 * Can be extended for readiness/liveness checks, uptime, etc.
 */
@JsonController()
export class HealthController {
  /**
   * GET /
   * Returns API health status.
   */
  @Get("/")
  health() {
    return { result: "Hello World" };
  }
}
