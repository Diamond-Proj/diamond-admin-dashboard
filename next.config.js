/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh'
      }
    ]
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination:
          // TODO : need to check if this is the right way to do it
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:5328/api/:path*'
            : process.env.HOST + '/api/:path*'
      }
    ];
  },
  // output: 'standalone',
};

module.exports = nextConfig;
