/**
 * Each store's layout maps their real aisle sequence to our 10 categories.
 *
 * Logo URLs — all are direct public SVG files from Wikimedia Commons or
 * Wikipedia language editions (no authentication required):
 *
 *  Aldi          → Aldi Nord worldwide logo (Belgium uses Aldi Nord)
 *                  https://commons.wikimedia.org/wiki/File:AldiNord-WorldwideLogo.svg
 *  Carrefour     → Logo_Carrefour.svg hosted on fr.wikipedia
 *                  https://fr.wikipedia.org/wiki/Fichier:Logo_Carrefour.svg
 *  Lidl          → Lidl-Logo.svg on Wikimedia Commons (confirmed path 9/91/)
 *                  https://commons.wikimedia.org/wiki/File:Lidl-Logo.svg
 *  Spar          → Spar-logo.svg on Wikimedia Commons
 *                  https://commons.wikimedia.org/wiki/File:Spar-logo.svg
 *  Colruyt       → Colruyt_logo.svg on Wikimedia Commons
 *                  https://commons.wikimedia.org/wiki/File:Colruyt_logo.svg
 *  Delhaize      → Delhaize_wordmark.svg on Wikimedia Commons
 *                  https://commons.wikimedia.org/wiki/File:Delhaize_wordmark.svg
 *  OKay          → Colruyt_Group_logo.svg on Wikimedia Commons
 *                  (no dedicated OKay logo exists on Wikimedia; OKay is a
 *                   Colruyt Group sub-brand — replace with a local asset if needed)
 *                  https://commons.wikimedia.org/wiki/File:Colruyt_Group_logo.svg
 */
export const STORES = [
  {
    id: 'aldi',
    name: 'Aldi',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/AldiNord-WorldwideLogo.svg',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Other', 'Pantry', 'Beverages', 'Frozen', 'Snacks', 'Household'],
  },
  {
    id: 'carrefour-market',
    name: 'Carrefour Market',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'lidl',
    name: 'Lidl',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Lidl-Logo.svg',
    layout: ['Produce', 'Bakery', 'Dairy', 'Meat & Seafood', 'Other', 'Pantry', 'Beverages', 'Frozen', 'Snacks', 'Household'],
  },
  {
    id: 'spar',
    name: 'Spar',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Spar-logo.svg',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'carrefour-express',
    name: 'Carrefour Express',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/3/3b/Logo_Carrefour.svg',
    layout: ['Produce', 'Bakery', 'Dairy', 'Meat & Seafood', 'Beverages', 'Snacks', 'Pantry', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'colruyt',
    name: 'Colruyt',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Colruyt_logo.svg',
    layout: ['Beverages', 'Pantry', 'Household', 'Produce', 'Meat & Seafood', 'Dairy', 'Bakery', 'Snacks', 'Frozen', 'Other'],
  },
  {
    id: 'proxy-delhaize',
    name: 'Proxy Delhaize',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Delhaize_wordmark.svg',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'ad-delhaize',
    name: 'AD Delhaize',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Delhaize_wordmark.svg',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'delhaize',
    name: 'Delhaize (Le Lion)',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Delhaize_wordmark.svg',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Beverages', 'Pantry', 'Snacks', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'okay',
    name: 'OKay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Colruyt_Group_logo.svg',
    layout: ['Produce', 'Bakery', 'Snacks', 'Pantry', 'Household', 'Meat & Seafood', 'Dairy', 'Beverages', 'Frozen', 'Other'],
  },
];
