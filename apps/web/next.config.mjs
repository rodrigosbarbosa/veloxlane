/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@veloxlane/auth",
    "@veloxlane/brand",
    "@veloxlane/schemas",
    "@veloxlane/ui",
  ],
};

export default nextConfig;
