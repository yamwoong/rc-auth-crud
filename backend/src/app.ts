import "reflect-metadata";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { UserController } from "@/controllers/user.controller";
import { HealthController } from "@/controllers/health.controller";
import { ResponseWrapperInterceptor } from "@/interceptors/response.interceptor";
import { ErrorHandler } from "@/middlewares/error.middleware";

// Set routing-controllers to use typedi for dependency injection
useContainer(Container);

// Create express app via routing-controllers
const app = createExpressServer({
  controllers: [UserController, HealthController], // Register controllers
  middlewares: [ErrorHandler], // Register global error handler
  interceptors: [ResponseWrapperInterceptor], // Register response wrapper interceptor
  defaultErrorHandler: false,
});

// Export the app instance
export default app;
