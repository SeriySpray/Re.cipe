const express = require('express');
const pool    = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

// GET /api/folders
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM folders WHERE user_id=$1 ORDER BY name',
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/folders
router.post('/', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO folders (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.id, name]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/folders/:id/recipes — add recipe to folder
router.post('/:id/recipes', auth, async (req, res) => {
  const { recipe_id } = req.body;
  if (!recipe_id) return res.status(400).json({ error: 'recipe_id is required' });
  try {
    await pool.query(
      `INSERT INTO folder_recipes (folder_id, recipe_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.params.id, recipe_id]
    );
    res.status(201).json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/folders/:id/recipes/:recipeId
router.delete('/:id/recipes/:recipeId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM folder_recipes WHERE folder_id=$1 AND recipe_id=$2',
      [req.params.id, req.params.recipeId]
    );
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
