// Products organised by category.
// 'common' = shown in the top "Common" section (most frequently bought)
// 'all'    = shown in the "All" section below (excludes common to avoid duplication)
export const PRODUCTS = {
  'Fresh Produce': {
    common: ['Bananas','Apples','Tomatoes','Onions','Potatoes','Carrots','Lettuce','Spinach','Avocado','Lemons'],
    all: ['Artichoke','Asparagus','Basil','Beets','Bell Peppers','Blueberries','Broccoli',
          'Brussels Sprouts','Cabbage','Cauliflower','Celery','Cherries','Cilantro','Corn',
          'Cucumber','Eggplant','Garlic','Ginger','Grapes','Green Beans','Jalapeños','Kale',
          'Kiwi','Limes','Mangoes','Mushrooms','Nectarines','Oranges','Parsley','Peaches',
          'Pears','Peas','Pineapple','Plums','Raspberries','Shallots','Strawberries',
          'Sweet Potatoes','Thyme','Watermelon','Zucchini'],
  },
  'Bakery & Deli': {
    common: ['Sandwich Bread','Baguette','Bagels','Croissants','Whole Wheat Bread','Pita Bread',
             'Ham','Turkey Slices','Salami','Roast Beef'],
    all: ['Brioche','Ciabatta','Dinner Rolls','English Muffins','Focaccia','Gluten-Free Bread',
          'Naan','Rye Bread','Sourdough','Tortillas','Wraps','Cheese Slices','Pastrami',
          'Prosciutto','Mortadella'],
  },
  'Dairy & Eggs': {
    common: ['Milk','Eggs','Butter','Cheddar Cheese','Yogurt','Mozzarella','Cream Cheese','Sour Cream'],
    all: ['Almond Milk','Blue Cheese','Brie','Colby Jack','Cottage Cheese','Feta','Goat Cheese',
          'Greek Yogurt','Gruyère','Half & Half','Heavy Cream','Kefir','Oat Milk','Parmesan',
          'Provolone','Ricotta','Swiss Cheese','Whipped Cream'],
  },
  'Snacks & Sweets': {
    common: ['Chips','Crackers','Mixed Nuts','Cookies','Granola Bars','Dark Chocolate','Candy','Popcorn'],
    all: ['Almonds','Cashews','Cheese Puffs','Dried Fruit','Fruit Snacks','Gummies',
          'Hummus','Jerky','Pistachios','Pretzels','Rice Cakes','Salsa',
          'Trail Mix','Walnuts'],
  },
  'Pantry': {
    common: ['Pasta','Rice','Olive Oil','Canned Tomatoes','Flour','Sugar','Salt','Pepper'],
    all: ['Balsamic Vinegar','Black Beans','Bread Crumbs','Brown Sugar','Cereal','Chicken Broth',
          'Chocolate Chips','Coconut Milk','Coconut Oil','Corn Starch','Dijon Mustard',
          'Honey','Ketchup','Lentils','Maple Syrup','Mayonnaise','Mustard','Oats',
          'Peanut Butter','Quinoa','Red Wine Vinegar','Soy Sauce','Sunflower Oil',
          'Tahini','Tomato Paste','Vanilla Extract','Vegetable Broth','White Wine Vinegar'],
  },
  'Beverages': {
    common: ['Sparkling Water','Orange Juice','Coffee','Tea','Soda','Beer','Wine','Oat Milk'],
    all: ['Apple Juice','Coconut Water','Cold Brew','Energy Drinks','Gatorade','Grapefruit Juice',
          'Green Tea','Herbal Tea','Iced Tea','Lemonade','Smoothie','Sports Drinks','Tonic Water'],
  },
  'Home & Care': {
    common: ['Paper Towels','Dish Soap','Laundry Detergent','Toilet Paper','Trash Bags','Sponges',
             'Toothpaste','Shampoo'],
    all: ['Air Freshener','Aluminum Foil','Batteries','Bleach','Candles','Cleaning Spray',
          'Conditioner','Deodorant','Dryer Sheets','Fabric Softener','Floss','Glass Cleaner',
          'Hand Soap','Latex Gloves','Lotion','Parchment Paper','Plastic Wrap','Razor',
          'Sunscreen','Tissues','Vitamins','Zip Lock Bags'],
  },
  'Frozen': {
    common: ['Ice Cream','Frozen Pizza','French Fries','Chicken Nuggets','Frozen Vegetables','Peas'],
    all: ['Burritos','Edamame','Fish Sticks','Frozen Berries','Frozen Waffles','Hash Browns',
          'Lasagna','Mixed Vegetables','Pot Pies','Sorbet','Tater Tots'],
  },
  'Other': {
    common: ['Vitamins','Protein Powder','Pet Food','Baby Food','Ibuprofen','Hand Sanitizer'],
    all: ['Allergy Medicine','Body Wash','Mouthwash'],
  },
};
