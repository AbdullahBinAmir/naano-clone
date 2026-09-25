import { z } from "zod";

export const creatorSettingsSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your name").max(120),
  linkedinPublicUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/.+/i.test(v), "Enter a full LinkedIn URL (https://linkedin.com/in/…)"),
});

export const brandSettingsSchema = z.object({
  companyName: z.string().trim().min(1, "Enter your company name").max(120),
  industry: z.string().trim().max(120),
});
