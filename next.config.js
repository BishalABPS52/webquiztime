/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Configure fonts to be properly loaded
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      issuer: { and: [/\.(js|ts|jsx|tsx|md|mdx)$/] },
      type: 'asset/resource',
    });
    
    return config;
  },
};

module.exports = nextConfig;
