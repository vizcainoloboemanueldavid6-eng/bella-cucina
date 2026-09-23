/** Dietary badges shown next to a dish. Add new keys to `menuTagLabels` too. */
export type MenuTag = 'V' | 'GF';

export type MenuItem = {
  name: string;
  description: string;
  /** USD. Whole numbers render as "$18", decimals as "$18.50". */
  price: number;
  tags?: MenuTag[];
};

export type MenuCategory = {
  /** Used for the tab id and the `aria-controls` wiring — keep it URL-safe. */
  id: string;
  label: string;
  blurb: string;
  items: MenuItem[];
};

export const menuTagLabels: Record<MenuTag, string> = {
  V: 'Vegetarian',
  GF: 'Gluten free',
};

export const menu: MenuCategory[] = [
  {
    id: 'antipasti',
    label: 'Antipasti',
    blurb: 'Small plates to open the table, meant to be passed around and shared.',
    items: [
      {
        name: 'Bruschetta al Pomodoro',
        description: 'Grilled sourdough, San Marzano tomatoes, torn basil, Ligurian olive oil.',
        price: 11,
        tags: ['V'],
      },
      {
        name: 'Burrata con Prosciutto',
        description: 'Creamy Puglian burrata, 24-month prosciutto di Parma, grilled peach.',
        price: 17,
        tags: ['GF'],
      },
      {
        name: 'Tagliere della Casa',
        description: 'Cured meats, aged cheeses, honeycomb, marinated olives and warm focaccia.',
        price: 24,
      },
      {
        name: 'Arancini di Ragù',
        description: 'Saffron risotto spheres, slow-cooked beef ragù, melted smoked scamorza.',
        price: 13,
      },
      {
        name: 'Carpaccio di Manzo',
        description: 'Thinly sliced beef, wild arugula, capers, shaved Parmigiano, lemon.',
        price: 19,
        tags: ['GF'],
      },
      {
        name: 'Melanzane alla Parmigiana',
        description: 'Layered eggplant, tomato and mozzarella, baked until the edges catch.',
        price: 14,
        tags: ['V', 'GF'],
      },
    ],
  },
  {
    id: 'pasta',
    label: 'Pasta',
    blurb: 'Rolled, cut and filled every morning in the window facing the street.',
    items: [
      {
        name: 'Tagliatelle al Ragù Bolognese',
        description: 'Hand-cut egg tagliatelle, six-hour beef and pork ragù, Parmigiano Reggiano.',
        price: 22,
      },
      {
        name: 'Cacio e Pepe',
        description:
          'Tonnarelli, Pecorino Romano, cracked black pepper. Three ingredients, no shortcuts.',
        price: 19,
        tags: ['V'],
      },
      {
        name: 'Ravioli di Ricotta e Spinaci',
        description: "Handmade ravioli, sheep's ricotta and spinach, brown butter and crisp sage.",
        price: 21,
        tags: ['V'],
      },
      {
        name: 'Spaghetti alle Vongole',
        description: 'Clams, garlic, Vermentino, Calabrian chili and flat-leaf parsley.',
        price: 24,
      },
      {
        name: 'Pappardelle al Cinghiale',
        description: 'Wide ribbons with wild boar ragù braised overnight in Chianti.',
        price: 26,
      },
      {
        name: "Penne all'Arrabbiata",
        // No GF badge: the badge promises the dish as served is gluten free, and this one is
        // only gluten free if the guest asks for the substitution. The sentence says so.
        description: 'Tomato, garlic and Calabrian chili. Gluten-free penne on request.',
        price: 18,
        tags: ['V'],
      },
    ],
  },
  {
    id: 'pizza',
    label: 'Pizza',
    blurb: '48-hour dough, baked 90 seconds in a wood-fired oven at 900 °F.',
    items: [
      {
        name: 'Margherita D.O.P.',
        description: 'San Marzano tomato, fior di latte, basil, extra virgin olive oil.',
        price: 17,
        tags: ['V'],
      },
      {
        name: 'Diavola',
        description: 'Spicy Calabrian salami, tomato, mozzarella, finished with hot honey.',
        price: 20,
      },
      {
        name: 'Quattro Formaggi',
        description: 'Gorgonzola, fontina, pecorino and mozzarella, scattered with walnuts.',
        price: 21,
        tags: ['V'],
      },
      {
        name: 'Prosciutto e Rucola',
        description:
          'Prosciutto crudo added off the heat, arugula, shaved Parmigiano, cherry tomatoes.',
        price: 22,
      },
      {
        name: 'Marinara',
        description: 'Tomato, garlic, oregano and olive oil. The original Neapolitan pizza.',
        price: 14,
        tags: ['V'],
      },
      {
        name: 'Ortolana',
        description: 'Grilled zucchini, eggplant and peppers, red onion, basil pesto.',
        price: 19,
        tags: ['V'],
      },
    ],
  },
  {
    id: 'dolci',
    label: 'Dolci',
    blurb: 'Desserts from the family notebook, assembled to order at the pass.',
    items: [
      {
        name: 'Tiramisù della Nonna',
        description: 'Savoiardi soaked in espresso, mascarpone cream, a heavy dusting of cocoa.',
        price: 10,
        tags: ['V'],
      },
      {
        name: 'Panna Cotta ai Frutti di Bosco',
        description: 'Vanilla bean cream set just soft, forest berry compote.',
        price: 9,
        tags: ['V', 'GF'],
      },
      {
        name: 'Cannoli Siciliani',
        description: 'Crisp shells filled to order with sweet ricotta and candied orange.',
        price: 10,
        tags: ['V'],
      },
      {
        name: 'Torta Caprese',
        description: 'Flourless almond and dark chocolate cake, lightly whipped cream.',
        price: 11,
        tags: ['V', 'GF'],
      },
      {
        name: 'Affogato al Caffè',
        description: 'Fior di latte gelato drowned in a shot of hot espresso at the table.',
        price: 8,
        tags: ['V', 'GF'],
      },
    ],
  },
  {
    id: 'drinks',
    label: 'Drinks',
    blurb: 'A short, opinionated list. Ask us what is open by the glass tonight.',
    items: [
      {
        name: 'Aperol Spritz',
        description: 'Aperol, prosecco, a splash of soda and a slice of orange.',
        price: 13,
        tags: ['V', 'GF'],
      },
      {
        name: 'Negroni',
        description: 'Gin, Campari and sweet vermouth, stirred over a single rock.',
        price: 14,
        tags: ['V', 'GF'],
      },
      {
        name: 'Chianti Classico Riserva',
        description:
          'Sangiovese from Tuscany. Sour cherry, leather and a long finish. By the glass.',
        price: 12,
        tags: ['V', 'GF'],
      },
      {
        name: 'Barolo “Serralunga”',
        description: 'Nebbiolo from Piedmont. Dried rose, tar and firm tannin. By the glass.',
        price: 18,
        tags: ['V', 'GF'],
      },
      {
        name: 'Espresso',
        description: 'Single origin, roasted for us a few blocks away. Doppio on request.',
        price: 4,
        tags: ['V', 'GF'],
      },
      {
        name: 'Limoncello della Casa',
        description: 'Made in-house with Amalfi lemons and served properly ice cold.',
        price: 9,
        tags: ['V', 'GF'],
      },
    ],
  },
];
