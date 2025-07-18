/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/protrace' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/protrace' : '',
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig; 