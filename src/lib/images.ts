/**
 * Responsive image helpers.
 *
 * `npm run images` (scripts/images.mjs) resizes every photograph in `public/images` into the
 * widths listed here, naming them `<name>-<width>.webp`. A phone then downloads a 65 KB hero
 * instead of the 190 KB original, which is the difference between a fast Largest Contentful
 * Paint and a slow one.
 *
 * The width lists below and the ones in that script are the same numbers on purpose: a `srcset`
 * candidate that does not exist on disk is a 404, so if you change one, change the other.
 */

/** Widths generated for every photograph. */
export const VARIANT_WIDTHS = [480, 768, 1200, 1600] as const;

/**
 * The hero skips 768.
 *
 * It is `object-cover` behind a full-height section, so on a tall phone it has to fill a box
 * roughly three times taller than it is wide — far more image than the `100vw` in `sizes` says.
 * Offering 768 meant a common 1.75x phone picked it and upscaled it 2.6x. Leaving it out sends
 * those devices to the 1200 file instead, which is encoded lower and costs the same 65 KB.
 */
export const HERO_VARIANT_WIDTHS = [480, 1200, 1600] as const;

/**
 * Builds a `srcset` for one of the site's WebP photographs.
 *
 * @param src            Public path of the full-size file, e.g. `/images/hero-dining-room.webp`.
 * @param intrinsicWidth Real pixel width of that file — variants wider than it do not exist.
 * @param widths         Variant widths to offer. Defaults to the full set.
 */
export function responsiveSrcSet(
  src: string,
  intrinsicWidth: number,
  widths: readonly number[] = VARIANT_WIDTHS,
): string {
  const base = src.replace(/\.webp$/, '');
  const entries = widths
    .filter((width) => width < intrinsicWidth)
    .map((width) => `${base}-${width}.webp ${width}w`);
  entries.push(`${src} ${intrinsicWidth}w`);
  return entries.join(', ');
}

/**
 * `sizes` values for the places photographs appear, kept next to the layouts that imply them.
 * Each ends at the 1280px container cap so a 4K screen does not fetch a file it will never use.
 */
export const IMAGE_SIZES = {
  /** Hero photo, always full-bleed. */
  hero: '100vw',
  /** About portrait: half the container from lg up, nearly full width below. */
  portrait: '(min-width: 1280px) 600px, (min-width: 1024px) 45vw, (min-width: 640px) 60vw, 90vw',
  /** Gallery masonry: three columns from lg, two from sm, one below. */
  gallery: '(min-width: 1280px) 400px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw',
  /** Lightbox: a single large image, capped by the dialog's own max width. */
  lightbox: '(min-width: 1280px) 900px, (min-width: 1024px) 70vw, 92vw',
} as const;
