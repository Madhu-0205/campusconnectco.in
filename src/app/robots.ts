import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/settings/',
          '/messages/',
          '/auth/',
          '/checkout/',
          '/client-hub/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
