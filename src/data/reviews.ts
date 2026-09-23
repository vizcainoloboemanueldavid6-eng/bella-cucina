export type Review = {
  /** Fictional guest — see the "Sample reviews for demo purposes" note in the UI. */
  name: string;
  /** Short line under the name: city, occasion, or how often they visit. */
  meta: string;
  /** Whole stars, 1–5. */
  rating: number;
  quote: string;
  /** ISO date, rendered as "May 2026". */
  date: string;
};

export const reviews: Review[] = [
  {
    name: 'Elena Marchetti',
    meta: 'Regular since 2014',
    rating: 5,
    quote:
      'The tagliatelle tastes like the kitchen my grandmother ran in Bologna. I have brought every visiting relative here and not one has been disappointed.',
    date: '2026-05-18',
  },
  {
    name: 'David Okonkwo',
    meta: 'Anniversary dinner',
    rating: 5,
    quote:
      'We booked for two and were treated like the only table in the room. The sommelier found us a Barolo well under what we expected to spend.',
    date: '2026-04-02',
  },
  {
    name: 'Priya Raghunathan',
    meta: 'Friday lunch, twice a month',
    rating: 4,
    quote:
      'Best wood-fired crust in the neighborhood, and the kitchen never blinks at a gluten-free order. Busy at 8pm, so go early or book ahead.',
    date: '2026-03-21',
  },
  {
    name: 'Tomás Herrera',
    meta: 'First visit',
    rating: 5,
    quote:
      'I watched them roll the pasta through the window and walked straight in. Three courses later I understood why there was a line outside.',
    date: '2026-02-09',
  },
];
