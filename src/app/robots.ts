import { MetadataRoute } from 'next';
import { baseUrl } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/auth/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
