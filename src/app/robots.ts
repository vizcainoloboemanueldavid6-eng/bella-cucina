import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

/** `output: 'export'` requires route handlers to opt in to static generation explicitly. */
export const dynamic = 'force-static';

/** Emitted as a static /robots.txt by `output: 'export'`. */
export default function robots(): MetadataRoute.Robots {
  // No `host` directive: it was only ever a Yandex extension, it has been deprecated since 2018,
  // and every other crawler treats an unknown directive as noise.
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${site.seo.url}/sitemap.xml`,
  };
}
