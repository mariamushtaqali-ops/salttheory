import { MetadataRoute } from 'next'

const SITE_URL = 'https://salttheorylab.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin',
        '/admin/',
        '/account',
        '/dashboard',
        '/auth/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
