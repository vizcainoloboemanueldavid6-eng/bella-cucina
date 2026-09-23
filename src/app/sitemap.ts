import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

/** `output: 'export'` requires route handlers to opt in to static generation explicitly. */
export const dynamic = 'force-static';

/** Emitted as a static /sitemap.xml by `output: 'export'`. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.seo.url}/`,
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
