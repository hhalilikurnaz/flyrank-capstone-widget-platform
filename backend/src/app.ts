import express from "express";
import type { Request, Response } from "express";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Module routers (auth, widgets, submissions, delivery, dashboard) are
  // mounted here as each one ships.

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
