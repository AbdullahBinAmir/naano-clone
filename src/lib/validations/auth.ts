import { z } from "zod";

const password = z.string().min(8, "At least 8 characters");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email"),
  password,
});

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

export const updatePasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });

export const onboardingSchema = z.object({
  role: z.enum(["creator", "brand"]),
});
