'use client';

import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { reviews } from '@/data/reviews';
import { cn } from '@/lib/utils';

const STAR_POSITIONS = [1, 2, 3, 4, 5];

/**
 * "2026-05-18" -> "May 2026". Built from the string parts rather than `new Date(iso)`,
 * which parses as UTC and can land on the previous month west of Greenwich.
 */
function formatMonthYear(isoDate: string): string {
  const [year, month] = isoDate.split('-').map(Number);
  if (!year || !month) return isoDate;
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="sr-only">{`Rated ${rating} out of 5`}</span>
      {STAR_POSITIONS.map((position) => (
        <Star
          key={position}
          aria-hidden="true"
          strokeWidth={1.5}
          // gold-dark, not gold: a filled #C9A227 star on the near-white card is 2.2:1, under
          // the 3:1 WCAG asks of a graphic that carries meaning. The darker token reads the same.
          className={cn(
            'h-5 w-5',
            position <= rating ? 'fill-current text-gold-dark' : 'text-ink/45',
          )}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  const [active, setActive] = useState(0);
  const total = reviews.length;
  const review = reviews[active];

  const goTo = (index: number) => setActive(((index % total) + total) % total);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(active - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(active + 1);
    }
  };

  return (
    <section id="reviews" className="section bg-cream-dark" aria-labelledby="reviews-heading">
      <div className="container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Reviews</p>
          <h2 id="reviews-heading" className="section-title">
            What our guests say
          </h2>
          <p className="mt-4 text-sm text-ink-muted">Sample reviews for demo purposes</p>
        </Reveal>

        <Reveal delay={120} className="mx-auto mt-12 max-w-3xl sm:mt-16">
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label="Guest reviews"
            onKeyDown={handleKeyDown}
          >
            <div aria-live="polite">
              {/* Keyed so each slide remounts and replays the entrance animation. */}
              <figure
                key={active}
                className="card animate-fade-in rounded-4xl p-8 text-center [animation-duration:280ms] sm:p-12"
              >
                <Quote
                  aria-hidden="true"
                  strokeWidth={1}
                  className="mx-auto h-10 w-10 fill-current text-gold/30 sm:h-12 sm:w-12"
                />

                <div className="mt-6">
                  <Stars rating={review.rating} />
                </div>

                <blockquote className="mt-6">
                  <p className="font-display text-xl italic leading-relaxed text-ink sm:text-2xl">
                    {`“${review.quote}”`}
                  </p>
                </blockquote>

                <figcaption className="mt-8">
                  <div className="rule mx-auto max-w-[8rem]" />
                  <p className="mt-6 font-semibold tracking-wide text-ink">{review.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">{review.meta}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-muted">
                    {formatMonthYear(review.date)}
                  </p>
                </figcaption>
              </figure>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 sm:gap-5">
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                aria-label="Previous review"
                className="btn-secondary h-12 w-12 shrink-0 border-ink/25 p-0"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1">
                {reviews.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Go to review ${index + 1} of ${total}`}
                    aria-current={index === active ? 'true' : undefined}
                    className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'block h-2.5 rounded-full transition-all duration-200 ease-entrance',
                        index === active
                          ? 'w-6 bg-terracotta'
                          : 'w-2.5 bg-ink/50 group-hover:bg-ink/70',
                      )}
                    />
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => goTo(active + 1)}
                aria-label="Next review"
                className="btn-secondary h-12 w-12 shrink-0 border-ink/25 p-0"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
