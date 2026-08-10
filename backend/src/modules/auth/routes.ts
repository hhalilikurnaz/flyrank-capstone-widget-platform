import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "./schema";
import { changePassword, loginTenant, registerTenant, requestPasswordReset, resetPassword, updateProfile } from "./service";

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

authRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const input = forgotPasswordSchema.parse(req.body);
    await requestPasswordReset(input);
    // Always the same response, whether or not the email exists.
    res.status(200).json({ message: "If an account exists for that email, a reset link has been sent." });
  }),
);

authRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const input = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(input);
    res.status(200).json(result);
  }),
);

authRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateProfileSchema.parse(req.body);
    const tenant = await updateProfile(req.tenantId!, input);
    res.status(200).json({ tenant });
  }),
);

authRouter.post(
  "/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = changePasswordSchema.parse(req.body);
    await changePassword(req.tenantId!, input);
    res.status(200).json({ message: "Password updated" });
  }),
);
