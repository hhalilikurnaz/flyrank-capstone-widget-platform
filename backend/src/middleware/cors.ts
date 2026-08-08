import cors from "cors";
import { env } from "@/lib/env";

// The widget lives on websites we don't control, so the submission/delivery
// path must accept requests from any origin. No cookies are used (JWT is
// header-based), so credentials stay disabled — origin: "*" is safe here.
export const publicCors = cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"] });

// The owner dashboard is a known, single-origin SPA — lock CORS down to it.
export const appCors = cors({ origin: env.FRONTEND_URL });
