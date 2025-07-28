import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      '*.cloudworkstations.dev',
      '*.firebase.studio'
    ]
  },
  webpack: (config, { isServer }) => {
    // This is to fix a bug with node-routeros
    // that tries to import a dev dependency.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'source-map-support': false,
      };
    }
    return config;
  },
};

export default nextConfig;
