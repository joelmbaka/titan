console.log("Loading next.config.js...");
console.log("VERCEL_API_TOKEN from process.env:", process.env.VERCEL_API_TOKEN);

const nextConfig = {
  env: {
    VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN,
    VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
    NEO4J_URI: process.env.NEO4J_URI,
    NEO4J_USER: process.env.NEO4J_USER,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
    // ... other environment variables ...
  },
  // ... rest of your config ...
};

console.log("Next.js config:", nextConfig);
export default nextConfig;