import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";

interface AccessTokenPayload {
  tenantId: string;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    req.tenantId = payload.tenantId;
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}
