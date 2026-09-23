'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { GalleryImage } from '@/data/gallery';
import { IMAGE_SIZES, responsiveSrcSet } from '@/lib/images';

type LightboxProps = {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Only one viewer can be open at a time, so a constant id is safe. */
const STATUS_ID = 'lightbox-status';

function isContent(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('[data-lightbox-content]') !== null;
}

/**
 * Self-contained image viewer: dialog semantics, focus trap, keyboard navigation
 * and body-scroll locking, with no dependency beyond the icon set.
 */
export default function Lightbox({ images, index, onIndexChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const pressedContent = useRef(false);

  const total = images.length;
  const image = images[index];
  const hasSiblings = total > 1;

  const goTo = useCallback(
    (next: number) => {
      onIndexChange(((next % total) + total) % total);
    },
    [onIndexChange, total],
  );

  // The parent never tells us what opened the dialog, so remember it ourselves.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;

    // Hiding the scrollbar widens the content box by its width, which shunts the whole page
    // sideways behind the fading backdrop. Pad by exactly what was removed.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'ArrowLeft' && hasSiblings) {
        event.preventDefault();
        goTo(index - 1);
        return;
      }

      if (event.key === 'ArrowRight' && hasSiblings) {
        event.preventDefault();
        goTo(index + 1);
        return;
      }

      if (event.key !== 'Tab') return;

      const root = dialogRef.current;
      if (!root) return;

      const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => element.getClientRects().length > 0,
      );

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      const active = document.activeElement;
      const outside = !(active instanceof Node) || !root.contains(active);

      if (event.shiftKey) {
        if (outside || active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (outside || active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goTo, hasSiblings, index, onClose]);

  // A drag that starts on the photo or the controls and lifts over the backdrop still
  // reports the backdrop as the click target, so remember where the press began.
  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    pressedContent.current = isContent(event.target);
  }

  function handleBackdropClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (pressedContent.current || isContent(event.target)) return;
    onClose();
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery photo viewer"
      // A live region never announces the content it is born with, so name the current
      // photo as the dialog's description too — that is what gets read on open.
      aria-describedby={STATUS_ID}
      onPointerDown={handlePointerDown}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex animate-fade-in flex-col gap-4 overscroll-contain bg-ink/95 p-4 backdrop-blur-sm sm:p-6"
    >
      <div className="flex justify-end">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          data-lightbox-content
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/45 bg-cream/10 text-cream transition-colors duration-200 ease-entrance hover:bg-cream hover:text-ink"
        >
          <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <img
          key={image.src}
          data-lightbox-content
          src={image.src}
          srcSet={responsiveSrcSet(image.src, image.width)}
          sizes={IMAGE_SIZES.lightbox}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="eager"
          decoding="async"
          className="h-auto max-h-full w-auto max-w-full animate-fade-in rounded-2xl object-contain shadow-lift"
        />
      </div>

      <div
        data-lightbox-content
        className="mx-auto flex w-full max-w-3xl shrink-0 items-center justify-between gap-4"
      >
        {hasSiblings ? (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous photo"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/45 bg-cream/10 text-cream transition-colors duration-200 ease-entrance hover:bg-cream hover:text-ink"
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </button>
        ) : null}

        <div id={STATUS_ID} aria-live="polite" className="min-w-0 flex-1 text-center">
          <p className="font-display text-base text-cream sm:text-lg">{image.caption}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            <span aria-hidden="true">
              {index + 1} / {total}
            </span>
            <span className="sr-only">{`Photo ${index + 1} of ${total}`}</span>
          </p>
        </div>

        {hasSiblings ? (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next photo"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/45 bg-cream/10 text-cream transition-colors duration-200 ease-entrance hover:bg-cream hover:text-ink"
          >
            <ChevronRight aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
