/**
 * Single source of truth for everything a restaurant owner would want to change.
 * Every component reads from here, so rebranding the site is a one-file edit.
 */

export type WeekdayHours = {
  /** Full day name, used as the row label and for structured data. */
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  /** `null` means the restaurant is closed that day. 24h "HH:MM" strings otherwise. */
  opens: string | null;
  closes: string | null;
};

export type SocialLink = {
  label: string;
  href: string;
  /** Matches an icon key in `src/components/SocialIcon.tsx`. */
  icon: 'instagram' | 'facebook' | 'twitter' | 'youtube';
};

/* --------------------------------------------------------------------------------------------
 * The four values a new owner has to change. Everything below is derived from them, so there is
 * never a second copy to forget: edit these and the links, greetings and structured data follow.
 * ----------------------------------------------------------------------------------------- */

/** Restaurant name. Feeds the logo, the page title, the WhatsApp greeting and the button labels. */
const NAME = 'Bella Cucina';

/** Phone number in E.164. The `tel:` link and the structured data are built from it. */
const PHONE_E164 = '+12125550148';

/** The same number as it should read on screen. */
const PHONE_DISPLAY = '+1 (212) 555-0148';

/**
 * WhatsApp account in international format — no `+`, no spaces, no dashes, which is what wa.me
 * expects. Replace this one line and both the floating button and the reservation form go live.
 * The number below is a reserved fiction number, so today the link opens WhatsApp and is refused.
 */
const WHATSAPP_NUMBER = '12125550148';

export const site = {
  name: NAME,
  legalName: 'Bella Cucina Trattoria',
  tagline: 'Handmade pasta, wood-fired pizza and family recipes since 1998.',
  shortDescription:
    'A family-run trattoria serving handmade pasta, wood-fired pizza and a curated Italian wine list in the heart of the city.',
  foundedYear: 1998,
  priceRange: '$$',
  cuisine: 'Italian',

  phone: {
    /** Human readable, shown in the UI. */
    display: PHONE_DISPLAY,
    /** E.164, used in `tel:` links and structured data. */
    e164: PHONE_E164,
    href: `tel:${PHONE_E164}`,
  },

  whatsapp: {
    number: WHATSAPP_NUMBER,
    link: `https://wa.me/${WHATSAPP_NUMBER}`,
    defaultMessage: `Hi ${NAME}! I'd like to ask about a reservation.`,
  },

  email: 'hello@bellacucina.example',

  address: {
    street: '184 Vincenzo Lane',
    district: 'Hudson Square',
    city: 'New York',
    region: 'NY',
    postalCode: '10013',
    country: 'United States',
    countryCode: 'US',
    get oneLine() {
      return `${this.street}, ${this.district}, ${this.city}, ${this.region} ${this.postalCode}`;
    },
  },

  geo: { latitude: 40.7256, longitude: -74.0085 },

  map: {
    /** OpenStreetMap embed — no API key, no tracking cookies. */
    embedSrc:
      'https://www.openstreetmap.org/export/embed.html?bbox=-74.0125%2C40.7236%2C-74.0045%2C40.7276&layer=mapnik&marker=40.7256%2C-74.0085',
    directionsHref:
      'https://www.openstreetmap.org/?mlat=40.7256&mlon=-74.0085#map=17/40.7256/-74.0085',
  },

  hours: [
    { day: 'Monday', opens: null, closes: null },
    { day: 'Tuesday', opens: '12:00', closes: '22:00' },
    { day: 'Wednesday', opens: '12:00', closes: '22:00' },
    { day: 'Thursday', opens: '12:00', closes: '22:00' },
    { day: 'Friday', opens: '12:00', closes: '23:00' },
    { day: 'Saturday', opens: '12:00', closes: '23:00' },
    { day: 'Sunday', opens: '12:00', closes: '21:00' },
  ] satisfies WeekdayHours[],

  social: [
    { label: 'Instagram', href: '#', icon: 'instagram' },
    { label: 'Facebook', href: '#', icon: 'facebook' },
    { label: 'X', href: '#', icon: 'twitter' },
    { label: 'YouTube', href: '#', icon: 'youtube' },
  ] satisfies SocialLink[],

  /** Constraints shared by the reservation form and its validation messages. */
  reservation: {
    earliestTime: '12:00',
    latestTime: '22:00',
    /** Minutes between selectable time slots. */
    slotMinutes: 30,
    minGuests: 1,
    maxGuests: 12,
    /** How far ahead a guest may book, in days. */
    maxDaysAhead: 180,
  },

  seo: {
    /** Absolute origin, used for canonical URLs, Open Graph and the sitemap. */
    url: 'https://bella-cucina-steel.vercel.app',
    title: 'Bella Cucina — Authentic Italian Restaurant',
    description:
      'Handmade pasta, wood-fired pizza and curated Italian wines in the heart of the city. Family recipes served since 1998. Book a table in seconds.',
    ogImage: '/og.jpg',
    locale: 'en_US',
  },

  nav: [
    { label: 'Menu', href: '#menu' },
    { label: 'About', href: '#about' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'Visit', href: '#visit' },
  ],

  demoNotice: 'Demo project — Bella Cucina is a fictional restaurant.',
} as const;

export type Site = typeof site;

/** "12:00" -> "12:00 PM". Used by the hours table and the reservation time picker. */
export function formatTime(time: string): string {
  const [hourPart, minutePart] = time.split(':');
  const hour = Number(hourPart);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minutePart} ${suffix}`;
}

/** Row label for the opening-hours table: "12:00 PM – 10:00 PM" or "Closed". */
export function formatHours(entry: WeekdayHours): string {
  if (!entry.opens || !entry.closes) return 'Closed';
  return `${formatTime(entry.opens)} – ${formatTime(entry.closes)}`;
}
