import "server-only";

export type SafepayEnv = "sandbox" | "production";

export interface SafepayConfig {
  env: SafepayEnv;
  /** Public "client" key sent when creating a payment. */
  apiKey: string;
  /** Merchant secret: authenticates our server-to-server reads and signs the checkout redirect. */
  secretKey: string;
  /** Shared secret that signs webhook deliveries. */
  webhookSecret: string;
  apiBase: string;
  checkoutBase: string;
}

const HOSTS = {
  sandbox: { api: "https://sandbox.api.getsafepay.com", checkout: "https://sandbox.api.getsafepay.com/checkout" },
  production: { api: "https://api.getsafepay.com", checkout: "https://getsafepay.com/checkout" },
} as const;

/** Names of any required variables that are missing (used for a friendly "not configured" message). */
export function missingSafepayEnv(): string[] {
  return ["SAFEPAY_API_KEY", "SAFEPAY_SECRET_KEY", "SAFEPAY_WEBHOOK_SECRET", "SUPABASE_SECRET_KEY"].filter((k) => !process.env[k]);
}

export function getSafepayConfig(): SafepayConfig {
  const missing = missingSafepayEnv();
  if (missing.length > 0) throw new Error(`Payments aren't configured (missing ${missing.join(", ")}).`);
  const env: SafepayEnv = process.env.SAFEPAY_ENV === "production" ? "production" : "sandbox";
  return {
    env,
    apiKey: process.env.SAFEPAY_API_KEY!,
    secretKey: process.env.SAFEPAY_SECRET_KEY!,
    webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET!,
    apiBase: HOSTS[env].api,
    checkoutBase: HOSTS[env].checkout,
  };
}
