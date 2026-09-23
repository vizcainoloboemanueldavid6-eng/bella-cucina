import { site } from '@/config/site';
import { menu } from '@/data/menu';

/**
 * schema.org `Restaurant` graph for the page.
 *
 * Everything is derived from `site.ts` and `data/`, so the rich result and the
 * visible page can never drift apart.
 */
export function restaurantJsonLd() {
  const openingHoursSpecification = site.hours
    .filter((entry) => entry.opens && entry.closes)
    .map((entry) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${entry.day}`,
      opens: entry.opens,
      closes: entry.closes,
    }));

  // `#` placeholders are not profiles. An empty sameAs array is worse than no sameAs at all.
  const sameAs = site.social.filter((link) => link.href !== '#').map((link) => link.href);

  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${site.seo.url}/#restaurant`,
    name: site.name,
    legalName: site.legalName,
    description: site.shortDescription,
    /** Keeps the demo status machine-readable, not only visible in the footer. */
    disambiguatingDescription: site.demoNotice,
    url: site.seo.url,
    image: `${site.seo.url}${site.seo.ogImage}`,
    logo: `${site.seo.url}/icon-512.png`,
    telephone: site.phone.e164,
    email: site.email,
    servesCuisine: site.cuisine,
    priceRange: site.priceRange,
    foundingDate: String(site.foundedYear),
    currenciesAccepted: 'USD',
    paymentAccepted: 'Cash, Credit Card',
    acceptsReservations: site.whatsapp.link,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHoursSpecification,
    ...(sameAs.length ? { sameAs } : {}),
    // Deliberately no aggregateRating. The four reviews on the page are invented and labelled as
    // samples; publishing them as a 4.8-star rating would feed a search engine a number no real
    // guest ever gave, which is exactly the kind of markup review-snippet policies forbid.
    hasMenu: {
      '@type': 'Menu',
      name: `${site.name} Menu`,
      hasMenuSection: menu.map((category) => ({
        '@type': 'MenuSection',
        name: category.label,
        description: category.blurb,
        hasMenuItem: category.items.map((item) => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          offers: {
            '@type': 'Offer',
            price: item.price.toFixed(2),
            priceCurrency: 'USD',
          },
        })),
      })),
    },
  };
}
