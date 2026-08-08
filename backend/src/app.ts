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

  // deliveryRouter and widgetsRouter apply CORS per-route internally (see
  // their source) rather than here — a bare app.use(cors(), router) with no
  // path applies to every request in the app, not just that router's own
  // routes, which previously broke preflight for unrelated endpoints.
  app.use(deliveryRouter);

  app.use("/api/auth", appCors, authRouter);
  app.use("/api/widgets", widgetsRouter);
  app.use("/api/submissions", publicCors, submissionsRouter);
  app.use("/api/dashboard", appCors, dashboardRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
