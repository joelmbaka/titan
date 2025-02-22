/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEO4J_URI: process.env.NEO4J_URI,
    NEO4J_USERNAME: process.env.NEO4J_USERNAME,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
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