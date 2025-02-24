import { z } from "zod";

const envSchema = z.object({
  VERCEL_API_TOKEN: z.string().min(1, "VERCEL_API_TOKEN is required"),
  // ... other environment variables ...
});

export const env = envSchema.parse(process.env); 