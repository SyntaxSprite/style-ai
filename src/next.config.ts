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
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
   webpack: (config, { isServer }) => {
    // These modules are required by `pdf-parse` but are not available in the
    // browser, so we tell webpack to ignore them.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "fs": false,
        "async_hooks": false,
      }
    }
    
    // Required for `docx` to work.
    config.externals.push({
      "fs": "fs",
      "canvas": "canvas",
    })
    
    return config
  },
};

export default nextConfig;
