/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // basePath and assetPrefix are only needed for web deployment, not for Tauri/desktop
  // basePath: process.env.NODE_ENV === 'production' ? '/protrace' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/protrace' : '',
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig; 