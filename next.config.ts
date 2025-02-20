import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEO4J_URI: process.env.NEO4J_URI,
    NEO4J_USERNAME: process.env.NEO4J_USERNAME,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  }
};

export default nextConfig;
