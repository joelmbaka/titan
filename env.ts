import { z } from "zod";

console.log("Loading environment variables...");
console.log("Raw process.env:", process.env);
console.log("VERCEL_API_TOKEN from process.env:", process.env.VERCEL_API_TOKEN);
console.log("VERCEL_TEAM_ID:", process.env.VERCEL_TEAM_ID);

const envSchema = z.object({
  VERCEL_API_TOKEN: z.string().min(1, "VERCEL_API_TOKEN is required"),
  VERCEL_TEAM_ID: z.string().min(1, "VERCEL_TEAM_ID is required"),
  // ... other environment variables ...
});

export const env = envSchema.parse({
  VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN,
  VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
});

console.log("Environment variables successfully validated:", env); 