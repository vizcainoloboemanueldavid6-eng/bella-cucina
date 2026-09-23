'use client';

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/useInView';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger, in milliseconds, applied as a CSS transition delay. */
  delay?: number;
  /** Rendered element. Defaults to a `div`. */
  as?: ElementType;
};

/**
 * Fades and lifts its children into place the first time they scroll into view.
 *
 * The hiding styles live in `globals.css` under `.js .reveal`, so with JavaScript
 * disabled the content renders plainly instead of staying invisible. Visitors who
 * prefer reduced motion get the final state immediately.
 */
export default function Reveal({ children, className, delay = 0, as }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType;
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={cn('reveal', inView && 'is-visible', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
