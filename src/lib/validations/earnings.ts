import { z } from "zod";

export const withdrawalSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000),
});

export const payoutMethodSchema = z.object({
  bankAccountHolder: z.string().trim().min(1, "Enter the account holder's name").max(120),
  bankLastFour: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Enter the last 4 digits of the account number"),
});
