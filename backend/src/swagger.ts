import { Application } from "express";
import { getMetadataArgsStorage } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import { UserController } from "@/controllers/user.controller";
import { HealthController } from "@/controllers/health.controller";

/**
 * Sets up Swagger UI at /docs endpoint.
 * @param app Express application instance (type-safe!)
 */
export function setupSwagger(app: Application) {
  const storage = getMetadataArgsStorage();
  const spec = routingControllersToSpec(
    storage,
    {
      controllers: [UserController, HealthController],
    },
    {
      info: {
        title: "rc-auth-crud API",
        version: "1.0.0",
        description:
          "Auto-generated API docs using routing-controllers-openapi",
      },
    }
  );
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
}
