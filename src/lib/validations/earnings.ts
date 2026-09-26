import { z } from "zod";

export const withdrawalSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000),
});

export const payoutMethodSchema = z.object({
  bankAccountHolder: z.string().trim().min(1, "Enter the account holder's name").max(120),
  bankName: z.string().trim().min(2, "Enter your bank's name").max(120),
  // IBAN or local account number; spaces and dashes are ignored.
  accountNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, "").toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9]{8,34}$/, "Enter your IBAN or account number (8–34 letters and digits)")),
});
