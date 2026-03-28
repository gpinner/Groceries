/**
 * Each store's layout maps their real aisle sequence to our 10 categories.
 * Logos via Clearbit Logo API (fallback to initials rendered in component).
 */
export const STORES = [
  {
    id: 'aldi',
    name: 'Aldi',
    logo: 'https://logo.clearbit.com/aldi.be',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Other', 'Pantry', 'Beverages', 'Frozen', 'Snacks', 'Household'],
  },
  {
    id: 'carrefour-market',
    name: 'Carrefour Market',
    logo: 'https://logo.clearbit.com/carrefour.be',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'lidl',
    name: 'Lidl',
    logo: 'https://logo.clearbit.com/lidl.be',
    layout: ['Produce', 'Bakery', 'Dairy', 'Meat & Seafood', 'Other', 'Pantry', 'Beverages', 'Frozen', 'Snacks', 'Household'],
  },
  {
    id: 'spar',
    name: 'Spar',
    logo: 'https://logo.clearbit.com/spar.be',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'carrefour-express',
    name: 'Carrefour Express',
    logo: 'https://logo.clearbit.com/carrefour.be',
    layout: ['Produce', 'Bakery', 'Dairy', 'Meat & Seafood', 'Beverages', 'Snacks', 'Pantry', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'colruyt',
    name: 'Colruyt',
    logo: 'https://logo.clearbit.com/colruyt.be',
    layout: ['Beverages', 'Pantry', 'Household', 'Produce', 'Meat & Seafood', 'Dairy', 'Bakery', 'Snacks', 'Frozen', 'Other'],
  },
  {
    id: 'proxy-delhaize',
    name: 'Proxy Delhaize',
    logo: 'https://logo.clearbit.com/delhaize.be',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'ad-delhaize',
    name: 'AD Delhaize',
    logo: 'https://logo.clearbit.com/delhaize.be',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'delhaize',
    name: 'Delhaize (Le Lion)',
    logo: 'https://logo.clearbit.com/delhaize.be',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Beverages', 'Pantry', 'Snacks', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'okay',
    name: 'OKay',
    logo: 'https://logo.clearbit.com/okay.be',
    layout: ['Produce', 'Bakery', 'Snacks', 'Pantry', 'Household', 'Meat & Seafood', 'Dairy', 'Beverages', 'Frozen', 'Other'],
  },
];
