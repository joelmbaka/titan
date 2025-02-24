console.log("Loading next.config.js...");
console.log("VERCEL_API_TOKEN from process.env:", process.env.VERCEL_API_TOKEN);

const nextConfig = {
  env: {
    VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN,
    // ... other environment variables ...
  },
  // ... rest of your config ...
};

console.log("Next.js config:", nextConfig);
export default nextConfig;