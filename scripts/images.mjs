/**
 * Generates the responsive variants every photograph on the site is served through.
 *
 *   npm run images
 *
 * For each `public/images/<name>.webp` it writes `<name>-<width>.webp` for every width in
 * `WIDTHS` that is smaller than the original, stepping the WebP quality down until the file
 * fits `MAX_BYTES`. Files that are already up to date are skipped, so re-running is cheap.
 *
 * The width lists here and in `src/lib/images.ts` must stay in step: a `srcset` candidate that
 * does not exist on disk is a 404 for whoever's browser picks it.
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const IMAGE_DIR = path.join(process.cwd(), 'public', 'images');
const MAX_BYTES = 200 * 1024;
const WIDTHS = [480, 768, 1200, 1600];

/**
 * Per-image overrides.
 *
 * The hero is `object-cover` behind a full-height section, so a phone has to fill a box far
 * taller than the `100vw` in its `sizes` suggests. Skipping 768 pushes those devices onto the
 * 1200 file, and the lower quality keeps that file at the same weight the 768 one had.
 */
const OVERRIDES = {
  'hero-dining-room': { widths: [480, 1200, 1600], maxQuality: 45 },
};

const QUALITY_STEPS = [80, 74, 68, 62, 56, 50, 44, 38];

async function encodeUnder(pipeline, limit, maxQuality) {
  for (const quality of QUALITY_STEPS.filter((step) => step <= maxQuality)) {
    const buffer = await pipeline.clone().webp({ quality, effort: 6 }).toBuffer();
    if (buffer.length <= limit) return { buffer, quality };
  }
  const buffer = await pipeline.clone().webp({ quality: 34, effort: 6 }).toBuffer();
  return { buffer, quality: 34 };
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

const files = (await readdir(IMAGE_DIR))
  .filter((file) => file.endsWith('.webp') && !/-\d+\.webp$/.test(file))
  .sort();

if (files.length === 0) {
  console.log(`No source photographs in ${IMAGE_DIR}.`);
  process.exit(0);
}

const force = process.argv.includes('--force');
let written = 0;

for (const file of files) {
  const source = path.join(IMAGE_DIR, file);
  const base = file.replace(/\.webp$/, '');
  const { widths = WIDTHS, maxQuality = 80 } = OVERRIDES[base] ?? {};
  const meta = await sharp(source).metadata();
  const made = [];

  for (const width of widths) {
    if (width >= meta.width) continue;

    const target = path.join(IMAGE_DIR, `${base}-${width}.webp`);
    if (!force && (await exists(target))) continue;

    const { buffer, quality } = await encodeUnder(
      sharp(source).resize({ width }),
      MAX_BYTES,
      maxQuality,
    );
    await writeFile(target, buffer);
    made.push(`${width}w ${Math.round(buffer.length / 1024)}KB q${quality}`);
    written += 1;
  }

  console.log(
    `${file} (${meta.width}x${meta.height}) ${made.length ? made.join('  ') : 'up to date'}`,
  );
}

console.log(
  `\n${written} variant${written === 1 ? '' : 's'} written. Pass --force to rebuild all.`,
);
