'use client';

import { useEffect, useState } from 'react';
import { ChefHat } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { useInView } from '@/hooks/useInView';
import { IMAGE_SIZES, responsiveSrcSet } from '@/lib/images';

type CounterProps = {
  /** The number that is animated. Rendered as `${value}${suffix}` once settled. */
  value: number;
  suffix: string;
  label: string;
};

const COUNT_DURATION_MS = 1600;

/** Only ever called from an effect, so `window` is guaranteed to exist. */
function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function Counter({ value, suffix, label }: CounterProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  // Starts at the final value so the server-rendered HTML — and anyone without
  // JavaScript — reads "25+" rather than a permanent "0+".
  const [shown, setShown] = useState(value);
  const finalText = `${value}${suffix}`;

  useEffect(() => {
    // JavaScript is running, so wind the figure back to zero before it is ever
    // on screen. Reduced motion keeps the final value and never counts.
    if (prefersReducedMotion()) return;
    setShown(0);
  }, []);

  useEffect(() => {
    if (!inView) return;

    // useInView reports `true` straight away for reduced motion, so the jump to the
    // final value has to be decided here as well or the count would still play.
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }

    let frame = 0;
    let startedAt = -1;

    const step = (now: number) => {
      if (startedAt < 0) startedAt = now;
      const progress = Math.min((now - startedAt) / COUNT_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    // Reversed so the figure reads first on screen while the DOM keeps the
    // label-then-value order a definition list needs.
    <div ref={ref} className="flex flex-col-reverse items-center text-center">
      <dt className="mt-3 text-sm font-medium uppercase tracking-[0.16em] text-ink-muted">
        {label}
      </dt>
      <dd className="font-display text-5xl font-semibold tabular-nums text-terracotta sm:text-6xl">
        {/* One string, the element's only child: React then rewrites the element's whole text
            content on every frame. Two separate text nodes ({shown}{suffix}) were updated in
            place, and after Chrome's page translation had swapped them for its own nodes the
            visitor was left looking at a frozen "0+". */}
        <span aria-hidden="true">{`${shown}${suffix}`}</span>
        <span className="sr-only">{finalText}</span>
      </dd>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="section bg-cream" aria-labelledby="about-heading">
      <div className="container">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
            <span
              aria-hidden="true"
              className="absolute -left-4 -top-4 h-full w-full rounded-2xl border border-gold/60 sm:-left-6 sm:-top-6"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-terracotta/10 sm:-bottom-6 sm:-right-6 sm:h-32 sm:w-32"
            />
            <img
              src="/images/chef-portrait.webp"
              srcSet={responsiveSrcSet('/images/chef-portrait.webp', 1000)}
              sizes={IMAGE_SIZES.portrait}
              alt="Head chef Marco Ferrante in a white jacket, arms folded at the flour-dusted kitchen pass, lit by the warm lamps of the dining room behind him."
              width={1000}
              height={1250}
              decoding="async"
              loading="lazy"
              className="relative w-full rounded-2xl object-cover shadow-lift"
            />
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow">Our Story</p>
            <h2 id="about-heading" className="section-title">
              A kitchen that never left the family
            </h2>
            <div className="mt-6 max-w-prose space-y-5 text-base leading-relaxed text-ink-muted sm:text-lg">
              <p>
                Rosa Ferrante — Nonna Rosa to two generations of regulars — opened Bella Cucina in
                1998 with eight tables, a second-hand oven and a pasta machine bolted to the counter
                by the window. On Fridays she sold tagliatelle straight through that window in brown
                paper, and half of Vincenzo Lane learned to line up for it before six. She cooked
                the way her mother had cooked outside Bologna: a ragù that goes on the heat in the
                morning and is still there at close. That pot has never been replaced, and nobody in
                this kitchen would dare scrub it properly.
              </p>
              <p>
                Her son Marco left for Bologna at nineteen and stayed six years — three in a pasta
                laboratory, three more on the line of a trattoria that seated forty and turned away
                a hundred. He came home in 2007 with his mother&rsquo;s recipes rewritten in his own
                hand, and in 2009 we took out the back wall for the wood oven that now runs hot
                every single night. Rosa still writes the specials board on Tuesdays and still
                checks the sfoglia by holding it up to the light. The room has been repainted twice
                and the wine list has quadrupled, but the flour, the patience and the argument over
                how thin the pasta should be are exactly where we left them.
              </p>
            </div>
            <p className="mt-8 flex items-center gap-3 font-display text-lg italic text-ink">
              <ChefHat
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-terracotta"
                strokeWidth={1.5}
              />
              — Marco Ferrante, Head Chef
            </p>
          </Reveal>
        </div>

        <div className="rule mt-16 lg:mt-24" aria-hidden="true" />

        <Reveal delay={80}>
          <dl className="mt-12 grid gap-12 sm:grid-cols-3 sm:gap-8">
            <Counter value={25} suffix="+" label="Years in the neighborhood" />
            <Counter value={40} suffix="+" label="Recipes from the family book" />
            <Counter value={12} suffix="k+" label="Happy guests a year" />
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
