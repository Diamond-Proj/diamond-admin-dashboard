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
    const flaskUrl = process.env.FLASK_URL || 'localhost:5328'
    // Use HTTPS for production domains, HTTP for localhost
    const protocol = flaskUrl.includes('localhost') ? 'http' : 'https'
    const baseUrl = flaskUrl.startsWith('http') ? flaskUrl : `${protocol}://${flaskUrl}`
    console.log('baseUrl: ', baseUrl)
    return [
      {
        source: '/api/:path*',
        destination: `${baseUrl}/api/:path*`
      }
    ]
  },
  // output: 'standalone',
};

module.exports = nextConfig;
