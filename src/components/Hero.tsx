import { ChevronDown } from 'lucide-react';
import { site } from '@/config/site';
import { HERO_VARIANT_WIDTHS, IMAGE_SIZES, responsiveSrcSet } from '@/lib/images';

const HERO_SRC = '/images/hero-dining-room.webp';
const HERO_WIDTH = 1920;
const HERO_HEIGHT = 1280;

/**
 * First paint of the page. The dining-room photo is the LCP element, so it is a plain
 * eager <img> with fetchPriority="high" rather than a CSS background, and it ships a
 * srcset so a phone downloads 62 KB instead of the 190 KB desktop file.
 */
export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden lg:min-h-screen"
    >
      <img
        src={HERO_SRC}
        srcSet={responsiveSrcSet(HERO_SRC, HERO_WIDTH, HERO_VARIANT_WIDTHS)}
        sizes={IMAGE_SIZES.hero}
        alt="Warmly lit trattoria dining room with linen-set tables, bentwood chairs and brass pendant lamps along an exposed brick wall"
        width={HERO_WIDTH}
        height={HERO_HEIGHT}
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      {/* Flat tint carries the text contrast; the gradient deepens the top and bottom
          edges so the headline never sits on a bright patch of the photo. */}
      <div className="absolute inset-0 -z-10 bg-ink/60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/85 via-ink/45 to-ink/70" />

      {/* The underscores are load-bearing: Tailwind turns them into the spaces that
          calc() requires around its "+" operator. */}
      <div className="container relative pb-24 pt-[calc(var(--header-height)_+_3rem)] sm:pb-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="eyebrow text-shadow-hero animate-fade-in text-gold motion-reduce:animate-none">
            Trattoria · Est. {site.foundedYear}
          </p>

          <h1
            id="hero-title"
            className="text-shadow-hero mt-5 animate-fade-in font-display text-4xl leading-[1.08] text-cream motion-reduce:animate-none lg:text-6xl xl:text-7xl"
            style={{ animationDelay: '120ms' }}
          >
            Authentic Italian Cooking in the Heart of the City
          </h1>

          <p
            className="text-shadow-hero mt-6 max-w-xl animate-fade-in text-lg leading-relaxed text-cream-dark motion-reduce:animate-none sm:text-xl"
            style={{ animationDelay: '240ms' }}
          >
            {site.tagline}
          </p>

          <div
            className="mt-10 flex w-full animate-fade-in flex-col items-center gap-3 motion-reduce:animate-none sm:w-auto sm:flex-row sm:gap-4"
            style={{ animationDelay: '360ms' }}
          >
            <a href="#menu" className="btn-primary w-full sm:w-auto">
              View Menu
            </a>
            <a href="#reserve" className="btn-on-dark w-full sm:w-auto">
              Reserve a Table
            </a>
          </div>
        </div>
      </div>

      {/* Decorative only — never a focus stop, and it stops moving for reduced motion. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center sm:bottom-8"
      >
        <span
          className="flex h-11 w-11 animate-fade-in items-center justify-center rounded-full border border-cream/40 bg-cream/10 text-cream backdrop-blur-sm motion-reduce:animate-none motion-reduce:opacity-0"
          style={{ animationDelay: '640ms' }}
        >
          <ChevronDown
            className="h-5 w-5 animate-bounce motion-reduce:animate-none"
            strokeWidth={1.75}
            style={{ animationDuration: '2.4s' }}
          />
        </span>
      </span>
    </section>
  );
}
