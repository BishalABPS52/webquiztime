/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'quiztimeweb.vercel.app', 'quiztime-backend-efv0.onrender.com'],
  },
  compiler: {
    // Enable styled-components with compatible options
    styledComponents: {
      ssr: true, 
      displayName: true
    }
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
