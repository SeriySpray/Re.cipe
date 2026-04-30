const express = require('express');
const pool    = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

// Returns the ISO date string (YYYY-MM-DD) for Monday of the current week
function getMondayOfCurrentWeek() {
  const now  = new Date();
  const day  = now.getDay();                           // 0=Sun, 1=Mon … 6=Sat
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // shift to Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];           // "2026-04-27"
}

// GET /api/planner — current week's plan + meal slots
router.get('/', auth, async (req, res) => {
  const weekStart = getMondayOfCurrentWeek();
  try {
    const { rows: [plan] } = await pool.query(
      'SELECT * FROM meal_plans WHERE user_id=$1 AND week_start=$2',
      [req.user.id, weekStart]
    );
    if (!plan) return res.json({ plan: null, slots: [] });

    const { rows: slots } = await pool.query(
      `SELECT ms.id, ms.day_of_week, ms.meal_type,
              r.id AS recipe_id, r.title, r.difficulty, r.cook_time
       FROM meal_slots ms
       JOIN recipes r ON ms.recipe_id = r.id
       WHERE ms.meal_plan_id = $1
       ORDER BY ms.day_of_week, ms.meal_type`,
      [plan.id]
    );
    res.json({ plan, slots });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/planner/shopping — ingredient list for the current week
router.get('/shopping', auth, async (req, res) => {
  const weekStart = getMondayOfCurrentWeek();
  try {
    const { rows } = await pool.query(
      `SELECT i.name AS ingredient, ri.quantity, ri.unit, r.title AS recipe
       FROM meal_plans mp
       JOIN meal_slots ms         ON mp.id = ms.meal_plan_id
       JOIN recipe_ingredients ri ON ms.recipe_id = ri.recipe_id
       JOIN ingredients i         ON ri.ingredient_id = i.id
       JOIN recipes r             ON ms.recipe_id = r.id
       WHERE mp.user_id=$1 AND mp.week_start=$2
       ORDER BY i.name`,
      [req.user.id, weekStart]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/planner — save (replace) the current week's plan
router.put('/', auth, async (req, res) => {
  const { week_start, slots = [] } = req.body;
  if (!week_start) return res.status(400).json({ error: 'week_start is required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert meal_plan row
    const { rows: [plan] } = await client.query(
      `INSERT INTO meal_plans (user_id, week_start)
       VALUES ($1, $2)
       ON CONFLICT (user_id, week_start) DO UPDATE SET week_start = EXCLUDED.week_start
       RETURNING *`,
      [req.user.id, week_start]
    );

    // Replace all slots for this plan
    await client.query('DELETE FROM meal_slots WHERE meal_plan_id=$1', [plan.id]);

    for (const slot of slots) {
      await client.query(
        `INSERT INTO meal_slots (meal_plan_id, recipe_id, day_of_week, meal_type)
         VALUES ($1, $2, $3, $4)`,
        [plan.id, slot.recipe_id, slot.day_of_week, slot.meal_type]
      );
    }

    await client.query('COMMIT');
    res.json({ plan, slots_saved: slots.length });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
