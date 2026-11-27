import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  redirects() {
    return [
      {
        // 記事のファイル名の typo を直したため、公開済みの旧 URL を新 URL へ送る
        source: '/posts/ghost-of-phisical',
        destination: '/posts/ghost-of-physical',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
