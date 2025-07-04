import { JsonController, Get } from "routing-controllers";
import { Service } from "typedi";

/**
 * Controller for API health check endpoint.
 * Can be extended for readiness/liveness checks, uptime, etc.
 */
@Service()
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
