'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Fraction of the element that must be visible before it counts as in view. */
  threshold?: number;
  /** Shrinks the viewport so elements trigger slightly before their top edge. */
  rootMargin?: string;
  /** Stop observing after the first intersection. */
  once?: boolean;
};

/**
 * Reports whether an element has entered the viewport.
 *
 * Returns `true` immediately when IntersectionObserver is unavailable or the visitor
 * asked for reduced motion, so nothing depending on it can stay hidden.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Also reveal anything that is already ABOVE the viewport. A fast fling, a jump to
          // an anchor, or a browser restoring the scroll position can carry an element past
          // the fold between two samples without it ever reaching `threshold` — and with
          // `once` that would leave it stuck at opacity 0 for the rest of the visit.
          const scrolledPast = entry.boundingClientRect.bottom <= 0;
          if (entry.isIntersecting || scrolledPast) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      // The extra 0 threshold is what makes the scrolled-past case produce a callback at all:
      // an element that never becomes `threshold`-visible only ever crosses the 0 boundary.
      { threshold: [0, threshold], rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView } as const;
}
