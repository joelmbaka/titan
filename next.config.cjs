/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN,
  },
  images: {
    domains: ["avatars.githubusercontent.com"],
    loader: 'custom',
    loaderFile: './lib/imageLoader.js',
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['next-themes'],
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

module.exports = nextConfig;