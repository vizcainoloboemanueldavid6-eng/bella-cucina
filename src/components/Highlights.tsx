import { Flame, Wheat, Wine, type LucideIcon } from 'lucide-react';
import Reveal from '@/components/Reveal';

type Highlight = {
  icon: LucideIcon;
  title: string;
  body: string;
};

const highlights: Highlight[] = [
  {
    icon: Wheat,
    title: 'Fresh Handmade Pasta',
    body: 'Rolled, cut and left to rest every morning in the window facing the street, so the tagliatelle on your plate is hours old rather than months.',
  },
  {
    icon: Flame,
    title: 'Wood-Fired Oven',
    // Non-breaking space: "900" and "°F" must never split across two lines.
    body: 'Our oak-burning oven sits at 900 °F, hot enough to turn a hand-stretched base into a blistered, airy crust in 90 seconds.',
  },
  {
    icon: Wine,
    title: 'Curated Italian Wines',
    body: 'A deliberately short list, chosen region by region from Alto Adige whites to Sicilian reds, and poured by people who have tasted every bottle on it.',
  },
];

export default function Highlights() {
  return (
    <section id="highlights" className="section bg-cream" aria-labelledby="highlights-title">
      <div className="container">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Why Bella Cucina</p>
          <h2 id="highlights-title" className="section-title">
            Three things we refuse to rush
          </h2>
          <p className="section-lede">
            A trattoria moves fast at seven in the evening — but these three details keep their own
            pace, every single day.
          </p>
        </Reveal>

        {/* Preflight removes the marker, which also drops list semantics in Safari/VoiceOver. */}
        <ul role="list" className="mt-12 grid gap-6 sm:mt-14 md:grid-cols-3 lg:gap-8">
          {highlights.map(({ icon: Icon, title, body }, index) => (
            // The lift lives on an inner element: `Reveal` already animates the <li>'s transform.
            <Reveal as="li" key={title} delay={index * 110} className="h-full">
              <div className="card flex h-full flex-col gap-4 transition-all duration-300 ease-entrance hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-terracotta/10 text-terracotta">
                  <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="font-display text-xl leading-snug">{title}</h3>
                <p className="text-base leading-relaxed text-ink-muted">{body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
