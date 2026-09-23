import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'docs/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // The site is exported statically and served from a CDN, so plain <img> with
      // explicit dimensions is intentional; next/image adds no benefit when unoptimized.
      '@next/next/no-img-element': 'off',
    },
  },
];

export default eslintConfig;
