/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    // if (isServer) {
    //   config.plugins = [...config.plugins, new PrismaPlugin()]
    // }
    return config;
  },
};

module.exports = nextConfig;
