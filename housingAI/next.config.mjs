/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['react-map-gl'],
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;