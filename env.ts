import { z } from "zod";

const envSchema = z.object({
  VERCEL_API_TOKEN: z.string().min(1, "VERCEL_API_TOKEN is required"),
  // ... other environment variables ...
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = env.data; 