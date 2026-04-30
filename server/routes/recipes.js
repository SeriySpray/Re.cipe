const express = require('express');
const crypto  = require('crypto');
const pool    = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

// Reusable fragment: fetches a recipe with its ingredients as a JSON array
const RECIPE_WITH_INGREDIENTS = `
  SELECT r.*,
    COALESCE(
      json_agg(
        json_build_object(
          'id',       i.id,
          'name',     i.name,
          'quantity', ri.quantity,
          'unit',     ri.unit
        )
      ) FILTER (WHERE i.id IS NOT NULL),
      '[]'
    ) AS ingredients
  FROM recipes r
  LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
  LEFT JOIN ingredients i ON ri.ingredient_id = i.id
`;

// GET /api/recipes/share/:token — public, no auth required (must be before /:id)
router.get('/share/:token', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${RECIPE_WITH_INGREDIENTS}
       WHERE r.share_token = $1
       GROUP BY r.id`,
      [req.params.token]
    );
    if (!rows.length) return res.status(404).json({ error: 'Recipe not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recipes — all recipes for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${RECIPE_WITH_INGREDIENTS}
       WHERE r.user_id = $1
       GROUP BY r.id
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recipes/:id — single recipe
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `${RECIPE_WITH_INGREDIENTS}
       WHERE r.id = $1 AND r.user_id = $2
       GROUP BY r.id`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Recipe not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/recipes — create recipe with ingredients
router.post('/', auth, async (req, res) => {
  const { title, description, difficulty, cook_time, ingredients = [] } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO recipes (user_id, title, description, difficulty, cook_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, title, description || null, difficulty || null, cook_time || null]
    );
    const recipe = rows[0];

    for (const ing of ingredients) {
      // Insert ingredient if it doesn't exist, return its id either way
      const { rows: [ingredient] } = await client.query(
        `INSERT INTO ingredients (name)
         VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [ing.name.toLowerCase().trim()]
      );
      await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
         VALUES ($1, $2, $3, $4)`,
        [recipe.id, ingredient.id, ing.quantity || null, ing.unit || null]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(recipe);
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// PUT /api/recipes/:id — update recipe fields
router.put('/:id', auth, async (req, res) => {
  const { title, description, difficulty, cook_time } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE recipes
       SET title=$1, description=$2, difficulty=$3, cook_time=$4
       WHERE id=$5 AND user_id=$6
       RETURNING *`,
      [title, description, difficulty, cook_time, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Recipe not found' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM recipes WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ deleted: rows[0].id });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/recipes/:id/share — generate a share token
router.post('/:id/share', auth, async (req, res) => {
  try {
    const token = crypto.randomUUID();
    const { rows } = await pool.query(
      'UPDATE recipes SET share_token=$1 WHERE id=$2 AND user_id=$3 RETURNING share_token',
      [token, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ share_token: rows[0].share_token });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
