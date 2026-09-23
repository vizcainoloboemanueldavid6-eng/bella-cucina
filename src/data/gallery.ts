export type GalleryImage = {
  src: string;
  /** Descriptive alt text — never a filename, never "image of". */
  alt: string;
  /** Intrinsic size of the file on disk, so the grid reserves space before it loads. */
  width: number;
  height: number;
  /** Shown under the photo inside the lightbox. */
  caption: string;
};

/**
 * Order matters. The gallery is a CSS multi-column masonry, so the browser fills the columns in
 * this sequence and balances their heights. Landscape and portrait shots alternate deliberately
 * — sorting all the tall ones together leaves a large empty wedge in the last column.
 */
export const gallery: GalleryImage[] = [
  {
    src: '/images/pasta-handmade.webp',
    alt: 'A cook lifting a nest of freshly cut egg tagliatelle from a floured wooden board',
    width: 1200,
    height: 800,
    caption: 'Tagliatelle cut by hand every morning',
  },
  {
    src: '/images/antipasti-board.webp',
    alt: 'A sharing board of cured meats, cubed cheeses, grapes, dates and olives',
    width: 1200,
    height: 900,
    caption: 'Tagliere della casa, built to be passed around',
  },
  {
    src: '/images/pizza-wood-fired.webp',
    alt: 'A margherita pizza blistering inside a wood-fired oven with flames rising behind it',
    width: 1200,
    height: 900,
    caption: 'Ninety seconds at 900 °F in the wood-fired oven',
  },
  {
    src: '/images/pasta-plated.webp',
    alt: 'A bowl of spaghetti with tomato and herbs beside a glass of chilled red wine',
    width: 1200,
    height: 1500,
    caption: 'Spaghetti and a glass of Chianti Classico',
  },
  {
    src: '/images/wine-cellar.webp',
    alt: 'An iron rack of wine bottles set into a stone wall with ivy growing across it',
    width: 1200,
    height: 1500,
    caption: 'Two hundred labels, most of them Italian',
  },
  {
    src: '/images/table-spread.webp',
    alt: 'An overhead view of a wooden table covered with pasta dishes, bread and cocktails',
    width: 1200,
    height: 800,
    caption: 'Sunday lunch, seen from above',
  },
  {
    src: '/images/trattoria-interior.webp',
    alt: 'A candlelit corner table in the dining room, set with white linen and small lamps',
    width: 1200,
    height: 1500,
    caption: 'The corner table, kept for regulars',
  },
  {
    src: '/images/dessert-tiramisu.webp',
    alt: 'A plated tiramisù with rolled mascarpone cream dusted in bitter cocoa',
    width: 1200,
    height: 900,
    caption: 'Tiramisù della nonna, assembled at the pass',
  },
];
