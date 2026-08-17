import { Request, Response, NextFunction } from "express";
import { verifyAndGetTenantByKey } from "@/modules/api-keys/repository";
import { AppError } from "@/lib/errors";

export async function requireApiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const key = authHeader.slice("Bearer ".length);

  try {
    const result = await verifyAndGetTenantByKey(key);

    if (!result) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    req.tenantId = result.tenant.id;
    req.apiKeyId = result.apiKey.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid API key" });
  }
}

declare global {
  namespace Express {
    interface Request {
      apiKeyId?: string;
    }
  }
}
