import { Clock, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { formatHours, site } from '@/config/site';
import { cn } from '@/lib/utils';

const iconBadge =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta';

/** Links that sit alone on their line need a 44px tap target, not just a text baseline. */
const contactLink =
  'mt-0.5 inline-flex min-h-[44px] items-center text-ink underline decoration-ink-soft underline-offset-4 transition-colors hover:text-terracotta hover:decoration-terracotta';

export default function Visit() {
  const { address, map, phone } = site;

  return (
    <section id="visit" className="section bg-cream-dark" aria-labelledby="visit-heading">
      <div className="container">
        <div className="max-w-2xl">
          <p className="eyebrow">Visit Us</p>
          <h2 id="visit-heading" className="section-title">
            Find us on the corner of Vincenzo Lane
          </h2>
          <p className="section-lede">
            Two minutes from the Hudson Square waterfront, behind a green awning and a row of olive
            trees. The bar keeps a handful of seats for walk-ins every evening.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:items-stretch lg:gap-14">
          <Reveal className="flex flex-col gap-10">
            <ul className="space-y-8">
              <li className="flex gap-4">
                <span className={iconBadge}>
                  <MapPin className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-ink">Address</h3>
                  <address className="mt-1.5 not-italic leading-relaxed text-ink-muted">
                    <span className="block">{address.street}</span>
                    <span className="block">{address.district}</span>
                    <span className="block">
                      {address.city}, {address.region} {address.postalCode}
                    </span>
                  </address>
                  <a
                    href={map.directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-terracotta underline-offset-4 transition-colors hover:text-terracotta-dark hover:underline"
                  >
                    Get directions
                    <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </div>
              </li>

              <li className="flex gap-4">
                <span className={iconBadge}>
                  <Phone className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-ink">Phone</h3>
                  <a href={phone.href} className={contactLink}>
                    {phone.display}
                  </a>
                  <p className="text-sm text-ink-muted">
                    Large parties and private dining, call us any afternoon.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className={iconBadge}>
                  <Mail className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-ink">Email</h3>
                  <a href={`mailto:${site.email}`} className={cn(contactLink, 'break-words')}>
                    {site.email}
                  </a>
                  <p className="text-sm text-ink-muted">We reply within one working day.</p>
                </div>
              </li>
            </ul>

            <div className="card">
              <h3 className="flex items-center gap-2.5 font-display text-lg text-ink">
                <Clock className="h-5 w-5 text-terracotta" strokeWidth={1.75} aria-hidden="true" />
                Opening hours
              </h3>
              <table className="mt-5 w-full border-collapse text-sm">
                <caption className="sr-only">
                  Opening hours for each day of the week at {site.name}
                </caption>
                <tbody>
                  {site.hours.map((entry) => {
                    const closed = !entry.opens || !entry.closes;
                    return (
                      <tr key={entry.day} className="border-b border-ink/10 last:border-b-0">
                        <th
                          scope="row"
                          className="py-2.5 pr-4 text-left font-medium text-ink sm:py-3"
                        >
                          {entry.day}
                        </th>
                        {/* Both states use ink-muted: dimming "Closed" any further drops it to
                            3.8:1 on this card, and the word already carries the meaning. */}
                        <td
                          className={cn(
                            'py-2.5 text-right text-ink-muted sm:py-3',
                            closed && 'font-medium',
                          )}
                        >
                          {formatHours(entry)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="mt-5 text-sm text-ink-muted">
                The kitchen stops taking orders thirty minutes before closing.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120} className="flex flex-col">
            {/* The wrapper carries the focus ring: its own overflow-hidden would clip the
                iframe's, leaving keyboard users with no visible indicator on the map. */}
            {/* The height must come from the wrapper's own width, never from the sibling column:
                OpenStreetMap's Leaflet paints its tiles once and only re-renders on a window
                resize, so an iframe that grows after load (as it would with flex-1 once the web
                fonts settle the column beside it) keeps a map drawn at its first, smaller size. */}
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-ink/10 shadow-soft focus-within:ring-2 focus-within:ring-terracotta focus-within:ring-offset-2 focus-within:ring-offset-cream-dark lg:aspect-[4/5]">
              <iframe
                src={map.embedSrc}
                title={`Map showing ${site.name} at ${address.street}, ${address.city}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Map data &copy;{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-terracotta"
              >
                OpenStreetMap
                <span className="sr-only"> (opens in a new tab)</span>
              </a>{' '}
              contributors.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
