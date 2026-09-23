'use client';

import { useState } from 'react';
import { Expand } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Lightbox from '@/components/Lightbox';
import { gallery } from '@/data/gallery';
import { IMAGE_SIZES, responsiveSrcSet } from '@/lib/images';

export default function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="section bg-ink" aria-labelledby="gallery-heading">
      <div className="container">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-gold">Gallery</p>
          <h2 id="gallery-heading" className="section-title text-cream">
            A look inside
          </h2>
          <p className="section-lede text-cream/70">
            The dining room after dark, the oven at full heat, and the dishes that come out of it.
            Pick any photo to see it full size.
          </p>
        </Reveal>

        {/* Preflight strips list markers, which drops list semantics in Safari — restore them. */}
        <ul role="list" className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6">
          {gallery.map((image, index) => (
            <Reveal
              key={image.src}
              as="li"
              delay={index * 60}
              className="mb-4 break-inside-avoid lg:mb-6"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`Open photo: ${image.caption}`}
                // `isolate` keeps the hover zoom inside the rounded clip in Safari; `text-cream`
                // is only ever seen if a photo fails to load and the browser falls back to alt.
                className="group relative isolate block w-full overflow-hidden rounded-2xl bg-ink text-cream shadow-soft"
              >
                <img
                  src={image.src}
                  srcSet={responsiveSrcSet(image.src, image.width)}
                  sizes={IMAGE_SIZES.gallery}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full transition-transform duration-500 ease-entrance motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]"
                />

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/25 to-transparent p-4 opacity-0 transition-opacity duration-300 ease-entrance group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <span className="flex translate-y-2 items-end justify-between gap-3 transition-transform duration-300 ease-entrance group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:translate-y-0">
                    <span className="text-sm font-medium leading-snug text-cream">
                      {image.caption}
                    </span>
                    <Expand className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.75} />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>

      {openIndex !== null ? (
        <Lightbox
          images={gallery}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </section>
  );
}
