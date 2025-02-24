import { z } from "zod";

export const env = z
  .object({
    VERCEL_API_TOKEN: z.string(),
    // ... other environment variables ...
  })
  .parse(process.env); 