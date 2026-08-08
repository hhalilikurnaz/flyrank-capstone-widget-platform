import express from "express";
import type { Request, Response } from "express";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { appCors, publicCors } from "@/middleware/cors";
import { authRouter } from "@/modules/auth/routes";
import { widgetsRouter } from "@/modules/widgets/routes";
import { submissionsRouter } from "@/modules/submissions/routes";
import { deliveryRouter } from "@/modules/delivery/routes";
import { dashboardRouter } from "@/modules/dashboard/routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Trust exactly one hop (the reverse proxy / load balancer in front of
  // this service). `true` would trust the entire X-Forwarded-For chain,
  // which express-rate-limit correctly flags as spoofable — a client could
  // prepend arbitrary IPs to dodge per-IP rate limiting.
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Registered before /api/widgets so the public GET .../config route wins
  // over the auth-gated widgetsRouter mounted at the same prefix.
  app.use(publicCors, deliveryRouter);

  app.use("/api/auth", appCors, authRouter);
  app.use("/api/widgets", appCors, widgetsRouter);
  app.use("/api/submissions", publicCors, submissionsRouter);
  app.use("/api/dashboard", appCors, dashboardRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
