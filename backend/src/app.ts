import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import { errorHandler } from "@/middlewares/error.middleware";

// Create express app instance
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

//// Basic health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ result: "Hello World" });
});

app.use(errorHandler);

// Export the app instance for server and testing
export default app;
