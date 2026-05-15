require('dotenv').config();
const pool = require('./db');

const recipes = [
  {
    title: 'Pasta Carbonara',
    description: `1. Bring a large pot of salted water to a boil. Cook pasta until al dente, reserve 1 cup of pasta water before draining.
2. While pasta cooks, fry bacon in a cold pan over medium heat until crispy. Remove from heat and let cool slightly.
3. In a bowl, whisk together eggs and finely grated parmesan. Season generously with black pepper.
4. Add hot drained pasta to the bacon pan (off heat). Pour egg mixture over immediately, tossing quickly. Add pasta water a splash at a time to loosen into a creamy sauce.
5. The residual heat cooks the eggs — do not put back on the flame or they will scramble. Serve immediately with extra parmesan.`,
    difficulty: 3, cook_time: 25,
    ingredients: ['spaghetti','eggs','guanciale','pecorino romano','parmesan','black pepper','salt']
  },
  {
    title: 'Greek Salad',
    description: `1. Cut tomatoes into wedges and cucumber into half-moons. Slice red onion very thin and soak in cold water for 5 minutes to reduce sharpness.
2. Combine tomatoes, cucumber, drained onion, and kalamata olives in a large bowl.
3. Lay a thick slab of feta on top — do not crumble it, Greek style keeps it whole.
4. Drizzle generously with extra-virgin olive oil. Sprinkle dried oregano and a pinch of salt.
5. Serve with crusty bread to mop up the juices. Do not add dressing ahead of time — the salt draws moisture from the vegetables.`,
    difficulty: 1, cook_time: 10,
    ingredients: ['tomatoes','cucumber','red onion','kalamata olives','feta','olive oil','oregano','salt']
  },
  {
    title: 'Chicken Soup',
    description: `1. Place whole chicken pieces in a large pot. Cover with cold water and bring slowly to a boil. Skim off any foam that rises.
2. Add quartered onion, celery stalks, carrots, garlic cloves, peppercorns, and a bay leaf. Reduce to a gentle simmer.
3. Cook uncovered for 1 hour. The low simmer keeps the broth clear — a hard boil makes it cloudy.
4. Remove chicken. Shred meat off the bones and discard bones and whole vegetables.
5. Strain the broth. Return shredded chicken to the pot with fresh sliced carrots. Simmer 15 minutes until carrots are tender. Season with salt and fresh parsley.`,
    difficulty: 2, cook_time: 75,
    ingredients: ['whole chicken','carrots','celery','onion','garlic','bay leaf','peppercorns','parsley','salt']
  },
  {
    title: 'Banana Pancakes',
    description: `1. Mash 2 very ripe bananas in a bowl until smooth — the riper the banana, the sweeter and more flavourful the pancakes.
2. Add 2 eggs and whisk together. For fluffier pancakes, add a tablespoon of oat flour or almond flour.
3. Heat a non-stick pan over medium-low heat. Melt a small knob of butter.
4. Pour small rounds of batter (about 2 tbsp each). Cook 2–3 minutes until bubbles form and edges look set. Flip carefully — these are more delicate than regular pancakes.
5. Serve stacked with a drizzle of honey and sliced banana. Store leftovers in the fridge for up to 2 days.`,
    difficulty: 1, cook_time: 15,
    ingredients: ['ripe banana','eggs','oat flour','butter','honey','cinnamon']
  },
  {
    title: 'Beef Stir Fry',
    description: `1. Slice beef against the grain into thin strips. Toss with a pinch of baking soda and let rest 15 minutes — this tenderises the meat. Rinse off baking soda, pat dry.
2. Mix sauce: soy sauce, oyster sauce, sesame oil, a teaspoon of cornstarch, and a pinch of sugar. Set aside.
3. Heat a wok or large pan until smoking. Add oil and sear beef in a single layer for 1 minute without touching. Remove and set aside.
4. In the same wok, stir fry garlic and ginger for 30 seconds. Add broccoli florets and bell pepper. Toss on high heat for 2 minutes.
5. Return beef to the wok. Pour sauce over everything and toss until glossy and coated. Serve immediately over steamed rice.`,
    difficulty: 3, cook_time: 20,
    ingredients: ['beef sirloin','broccoli','bell pepper','soy sauce','oyster sauce','garlic','ginger','sesame oil','cornstarch']
  },
  {
    title: 'Roasted Tomato Soup',
    description: `1. Preheat oven to 200°C. Halve tomatoes and place cut-side up on a baking tray. Add garlic cloves and onion wedges. Drizzle with olive oil, salt, and pepper. Roast 40 minutes until caramelised.
2. Transfer everything from the tray — including all the juices — into a large pot. Add vegetable broth and bring to a simmer.
3. Blend with a hand blender until completely smooth. For a silkier texture, pass through a fine sieve.
4. Stir in a splash of cream. Taste and adjust seasoning. Add a pinch of sugar if too acidic.
5. Serve hot with a swirl of cream, fresh basil leaves, and crusty sourdough on the side.`,
    difficulty: 2, cook_time: 55,
    ingredients: ['plum tomatoes','onion','garlic','olive oil','vegetable broth','heavy cream','basil','salt','pepper']
  },
  {
    title: 'French Omelette',
    description: `1. Crack 3 eggs into a bowl. Season with salt and pepper. Beat vigorously with a fork — not a whisk — until fully combined and slightly frothy.
2. Heat a small non-stick pan over medium-high heat. Add butter and swirl until it foams and just begins to subside.
3. Pour in eggs. Immediately start stirring with a rubber spatula in small circles while shaking the pan. The goal is tiny curds forming a custard-like base.
4. When eggs are just set but still glossy on top (about 90 seconds), add filling along the centre: cheese, herbs, or sautéed mushrooms.
5. Roll the omelette onto a plate by tilting the pan. It should be pale yellow, not browned. Serve within 30 seconds.`,
    difficulty: 2, cook_time: 10,
    ingredients: ['eggs','unsalted butter','gruyere cheese','chives','salt','white pepper']
  },
  {
    title: 'Fudgy Chocolate Brownies',
    description: `1. Preheat oven to 175°C. Line a 20x20 cm tin with parchment paper. Melt dark chocolate and butter together in a bowl over simmering water (bain-marie). Stir until smooth. Let cool 5 minutes.
2. Whisk sugar into the chocolate mixture. Add eggs one at a time, whisking well after each. Add vanilla extract.
3. Sift in flour and cocoa. Fold gently with a spatula — do not overmix or brownies will be cakey. A few streaks of flour are fine.
4. Pour into prepared tin. Bake 20–22 minutes. The centre should still have a slight wobble when you shake the tin — they will firm up as they cool.
5. Cool completely in the tin before cutting. For clean slices, refrigerate 1 hour and cut with a hot dry knife.`,
    difficulty: 2, cook_time: 35,
    ingredients: ['dark chocolate 70%','unsalted butter','caster sugar','eggs','plain flour','cocoa powder','vanilla extract','salt']
  },
];

async function seed() {
  const { rows: users } = await pool.query('SELECT id, email FROM users ORDER BY id');

  if (users.length < 2) {
    console.log('Need at least 2 users. Found:', users.map(u => u.email));
    await pool.end(); return;
  }

  const half = Math.ceil(recipes.length / 2);

  for (let i = 0; i < recipes.length; i++) {
    const userId = users[i < half ? 0 : 1].id;
    const r = recipes[i];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [rec] } = await client.query(
        'INSERT INTO recipes (user_id,title,description,difficulty,cook_time) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [userId, r.title, r.description, r.difficulty, r.cook_time]
      );
      for (const name of r.ingredients) {
        const { rows: [ing] } = await client.query(
          'INSERT INTO ingredients (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id',
          [name]
        );
        await client.query(
          'INSERT INTO recipe_ingredients (recipe_id,ingredient_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [rec.id, ing.id]
        );
      }
      await client.query('COMMIT');
      console.log(`✓ "${r.title}" → ${users[i < half ? 0 : 1].email}`);
    } catch (e) {
      await client.query('ROLLBACK');
      console.log(`✗ "${r.title}":`, e.message);
    } finally {
      client.release();
    }
  }

  await pool.end();
  console.log('Done.');
}

seed();
