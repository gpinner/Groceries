/**
 * Each store's layout maps their real aisle sequence to our 10 categories.
 * Categories not explicitly positioned fall to the end.
 */
export const STORES = [
  {
    id: 'aldi',
    name: 'Aldi',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Other', 'Pantry', 'Beverages', 'Frozen', 'Snacks', 'Household'],
  },
  {
    id: 'carrefour-market',
    name: 'Carrefour Market',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'lidl',
    name: 'Lidl',
    layout: ['Produce', 'Bakery', 'Dairy', 'Meat & Seafood', 'Other', 'Pantry', 'Beverages', 'Frozen', 'Snacks', 'Household'],
  },
  {
    id: 'spar',
    name: 'Spar',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'carrefour-express',
    name: 'Carrefour Express',
    layout: ['Produce', 'Bakery', 'Dairy', 'Meat & Seafood', 'Beverages', 'Snacks', 'Pantry', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'colruyt',
    name: 'Colruyt',
    layout: ['Beverages', 'Pantry', 'Household', 'Produce', 'Meat & Seafood', 'Dairy', 'Bakery', 'Snacks', 'Frozen', 'Other'],
  },
  {
    id: 'proxy-delhaize',
    name: 'Proxy Delhaize',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'ad-delhaize',
    name: 'AD Delhaize',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Pantry', 'Snacks', 'Beverages', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'delhaize',
    name: 'Delhaize (Le Lion)',
    layout: ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy', 'Beverages', 'Pantry', 'Snacks', 'Household', 'Frozen', 'Other'],
  },
  {
    id: 'okay',
    name: 'OKay',
    layout: ['Produce', 'Bakery', 'Snacks', 'Pantry', 'Household', 'Meat & Seafood', 'Dairy', 'Beverages', 'Frozen', 'Other'],
  },
];
