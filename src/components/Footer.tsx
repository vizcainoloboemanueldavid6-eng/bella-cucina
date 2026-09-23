import { Mail, MapPin, Phone } from 'lucide-react';
import SocialIcon from '@/components/SocialIcon';
import CopyrightYear from '@/components/CopyrightYear';
import { formatHours, site, type WeekdayHours } from '@/config/site';

/** The global focus ring offsets in cream, which disappears on this dark panel — flip it to ink. */
const FOCUS_ON_DARK = 'focus-visible:ring-gold focus-visible:ring-offset-ink';

/**
 * `py-3` on a 20px line box makes every footer link a 44px touch target without
 * stretching the visual rhythm; `inline-block` (not flex) keeps long strings wrappable.
 */
const LINK = `inline-block rounded py-3 leading-5 text-cream/70 transition-colors duration-200 hover:text-cream ${FOCUS_ON_DARK}`;

const RESERVE_LINK = `inline-block rounded py-3 font-semibold leading-5 text-gold transition-colors duration-200 hover:text-gold-light ${FOCUS_ON_DARK}`;

const ICON = 'h-4 w-4 shrink-0 text-gold';

const SHORT_DAY: Record<WeekdayHours['day'], string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

/**
 * Collapses `site.hours` into one row per run of identical days, so the footer stays short and
 * the full table stays in the Visit section.
 *
 * Derived, never hardcoded: the previous version assumed Tue–Thu and Fri–Sat always match, and
 * would have published wrong hours the first time an owner gave Thursday a later closing time.
 */
function summariseHours(): { range: string; value: string }[] {
  const rows: { range: string; value: string }[] = [];

  for (const entry of site.hours) {
    const value = formatHours(entry);
    const previous = rows.at(-1);

    if (previous && previous.value === value) {
      // Extend the run: "Tue" becomes "Tue – Wed", then "Tue – Thu".
      const [first] = previous.range.split(' – ');
      previous.range = `${first} – ${SHORT_DAY[entry.day]}`;
    } else {
      rows.push({ range: SHORT_DAY[entry.day], value });
    }
  }

  return rows;
}

const HOURS_SUMMARY = summariseHours();

export default function Footer() {
  // Evaluated once during the static export. CopyrightYear takes it as the fallback and
  // corrects it on the client, so the notice cannot go stale on a long-lived deployment.
  const buildYear = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream">
      <div className="container py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="font-display text-2xl text-cream">{site.name}</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/70">{site.tagline}</p>

            <ul className="mt-6 flex flex-wrap items-center gap-3">
              {site.social.map((link) => {
                // Every handle is a placeholder "#" in this demo; only real URLs open in a new tab.
                const isExternal = link.href.startsWith('http');
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      aria-label={`${site.name} on ${link.label}`}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/45 text-cream/80 transition-colors duration-200 hover:border-cream hover:bg-cream hover:text-ink ${FOCUS_ON_DARK}`}
                    >
                      <SocialIcon name={link.icon} className="h-5 w-5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="eyebrow text-gold">
              Explore
            </h2>
            <ul className="mt-2 text-sm">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={LINK}>
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#reserve" className={RESERVE_LINK}>
                  Reserve a Table
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow text-gold">Contact</h2>
            <ul className="mt-4 space-y-1 text-sm text-cream/70">
              <li className="flex gap-3 py-1">
                <MapPin aria-hidden="true" strokeWidth={1.75} className={`mt-0.5 ${ICON}`} />
                <address className="not-italic leading-relaxed">{site.address.oneLine}</address>
              </li>
              <li className="flex items-center gap-3">
                <Phone aria-hidden="true" strokeWidth={1.75} className={ICON} />
                <a href={site.phone.href} className={LINK}>
                  {site.phone.display}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail aria-hidden="true" strokeWidth={1.75} className={ICON} />
                {/* `min-w-0` lets this flex item shrink so `break-words` can split the address. */}
                <a href={`mailto:${site.email}`} className={`${LINK} min-w-0 break-words`}>
                  {site.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-gold">Hours</h2>
            <dl className="mt-5 space-y-3 text-sm">
              {HOURS_SUMMARY.map((row) => (
                <div
                  key={row.range}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1"
                >
                  <dt className="text-cream/70">{row.range}</dt>
                  <dd className="text-cream">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/15">
        {/* The floating WhatsApp button parks in the bottom-right corner, so the last
            line of the page needs room to clear it. */}
        <div className="container flex flex-col gap-2 pb-20 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:pb-24">
          <p className="text-cream/70">
            © <CopyrightYear buildYear={buildYear} /> {site.name}. All rights reserved.
          </p>
          <p className="text-cream/60">{site.demoNotice}</p>
        </div>
      </div>
    </footer>
  );
}
