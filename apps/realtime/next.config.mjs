/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['ui'],
  images: {
    dangerouslyAllowSVG: false,
  },
}

export default nextConfig
