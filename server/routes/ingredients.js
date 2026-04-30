const express = require('express');
const pool    = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

// GET /api/ingredients — all unique ingredients across the user's recipes
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT i.id, i.name
       FROM ingredients i
       JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
       JOIN recipes r             ON ri.recipe_id = r.id
       WHERE r.user_id = $1
       ORDER BY i.name`,
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
