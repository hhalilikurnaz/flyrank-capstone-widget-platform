import express from "express";
import type { Request, Response } from "express";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { appCors, publicCors } from "@/middleware/cors";
import { authRouter } from "@/modules/auth/routes";
import { widgetsRouter } from "@/modules/widgets/routes";
import { submissionsRouter } from "@/modules/submissions/routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", true);
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/auth", appCors, authRouter);
  app.use("/api/widgets", appCors, widgetsRouter);
  app.use("/api/submissions", publicCors, submissionsRouter);

  // Module routers (delivery, dashboard) are mounted here as each one ships.

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
