/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        pro: "false",
    },
    images: {
        remotePatterns: [
            {
                hostname: '**',
              },
        ]
    }
}

module.exports = nextConfig
