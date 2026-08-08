import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { loginSchema, registerSchema } from "./schema";
import { loginTenant, registerTenant } from "./service";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const result = await registerTenant(input);
    res.status(201).json(result);
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await loginTenant(input);
    res.status(200).json(result);
  }),
);
