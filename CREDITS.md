# Credits

## Photography

Every photograph on this site comes from [Unsplash](https://unsplash.com) and is used under the
[Unsplash License](https://unsplash.com/license) (free to use commercially, no permission needed,
attribution appreciated — which is what this file is for).

Each file was re-encoded locally to WebP and kept under 200 KB, and `npm run images` derives the
smaller `-480` / `-768` / `-1200` / `-1600` siblings that the `srcset` attributes point at. The
originals are untouched on Unsplash; the links below point at them.

| File                                    | Used for                     | Photographer                                               | Original                                         |
| --------------------------------------- | ---------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `public/images/hero-dining-room.webp`   | Hero background              | [Brands&People](https://unsplash.com/@brandsandpeople)     | [Photo](https://unsplash.com/photos/iFyLBKmCrmQ) |
| `public/images/pasta-handmade.webp`     | Gallery — fresh tagliatelle  | [Vincent Dörig](https://unsplash.com/@vincentdoerig)       | [Photo](https://unsplash.com/photos/mciRIMaxiAM) |
| `public/images/pizza-wood-fired.webp`   | Gallery — wood-fired oven    | [Fabrizio Pullara](https://unsplash.com/@fabrizio_photopf) | [Photo](https://unsplash.com/photos/vHRFraV4U00) |
| `public/images/chef-portrait.webp`      | About — the chef             | [Louis Hansel](https://unsplash.com/@louishansel)          | [Photo](https://unsplash.com/photos/0sYLBZjgTTw) |
| `public/images/wine-cellar.webp`        | Gallery — wine rack          | [MChe Lee](https://unsplash.com/@mclee)                    | [Photo](https://unsplash.com/photos/A1EmRUNuTe4) |
| `public/images/antipasti-board.webp`    | Gallery — sharing board      | [Christian Alvarez](https://unsplash.com/@chrispyapple)    | [Photo](https://unsplash.com/photos/cTJlUjzSPVs) |
| `public/images/pasta-plated.webp`       | Gallery — spaghetti and wine | [Nima Naseri](https://unsplash.com/@nimanaseri)            | [Photo](https://unsplash.com/photos/ueC3A9CFkRU) |
| `public/images/table-spread.webp`       | Gallery — table from above   | [Nima Naseri](https://unsplash.com/@nimanaseri)            | [Photo](https://unsplash.com/photos/YL8Py0HMGIw) |
| `public/images/dessert-tiramisu.webp`   | Gallery — tiramisù           | [phoebe lynch](https://unsplash.com/@siorraidh)            | [Photo](https://unsplash.com/photos/kBRJ6dhhmYQ) |
| `public/images/trattoria-interior.webp` | Gallery — dining room        | [tommao wang](https://unsplash.com/@tommaomaoer)           | [Photo](https://unsplash.com/photos/aL9aqHz4SxI) |

`public/og.jpg` is generated locally from the hero photograph (same credit as above) with the site
name composited on top.

## Typefaces

| Family                                                                 | Used for         | Licence                                                   |
| ---------------------------------------------------------------------- | ---------------- | --------------------------------------------------------- |
| [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) | Headings         | [SIL Open Font License 1.1](https://openfontlicense.org/) |
| [Inter](https://fonts.google.com/specimen/Inter)                       | Body text and UI | [SIL Open Font License 1.1](https://openfontlicense.org/) |

Both are self-hosted at build time by `next/font/google`, so the deployed site makes no request to
Google Fonts and sets no third-party cookie.

## Icons

- [Lucide](https://lucide.dev) — [ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE).
- Instagram, Facebook, X and YouTube marks are inlined in `src/components/SocialIcon.tsx` from
  [Simple Icons](https://simpleicons.org) ([CC0 1.0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md)).
  The WhatsApp mark in `src/components/WhatsAppButton.tsx` comes from the same set. The brands
  themselves remain trademarks of their respective owners.

## Map

Map tiles and the embedded map come from [OpenStreetMap](https://www.openstreetmap.org), © OpenStreetMap
contributors, available under the [Open Database License](https://www.openstreetmap.org/copyright).
No API key and no tracking script is involved.

## Everything else

Copy, menu, reviews, opening hours, address, phone number and the restaurant itself are invented for
this portfolio piece. Bella Cucina does not exist.
