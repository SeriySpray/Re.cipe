# RE.cipe Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a PostgreSQL database and minimal Node.js/Express backend to RE.cipe so users can register, log in, and manage recipes — while the frontend stays as vanilla HTML/CSS/JS on GitHub Pages.

**Architecture:** The frontend (GitHub Pages) communicates with a local Node.js server via `fetch()`. Express handles HTTP routing, `pg` executes raw SQL against a local PostgreSQL database. JWT tokens stored in `localStorage` authenticate every protected request.

**Tech Stack:** Node.js, Express, pg (node-postgres), bcrypt, jsonwebtoken, cors, dotenv, PostgreSQL 15+

---

## File Map

| File | Responsibility |
|---|---|
| `server/server.js` | Express app entry point — mounts routes, configures CORS and JSON parsing |
| `server/db.js` | Creates and exports a single `pg.Pool` used by all routes |
| `server/schema.sql` | All `CREATE TABLE` statements — run once to initialize the database |
| `server/middleware/auth.js` | Reads the `Authorization` header, verifies JWT, attaches `req.user` |
| `server/routes/auth.js` | `POST /api/auth/register` and `POST /api/auth/login` |
| `server/routes/recipes.js` | Full CRUD for recipes + share token endpoint |
| `server/routes/folders.js` | Create folders and assign/remove recipes from them |
| `server/routes/planner.js` | Get/save weekly meal plan + generate shopping list |
| `server/routes/ingredients.js` | List all ingredients belonging to the current user's recipes |
| `server/DATABASE_EXPLAINED.md` | Beginner-friendly explanation of every concept and every file |
| `.env` | Secret config values — never committed to git |

---

## Task 1: Initialize the server project

**Files:**
- Create: `server/package.json` (via npm init)
- Create: `server/.env`
- Create: `server/.gitignore`

- [ ] **Step 1: Create the server directory and initialize npm**

```bash
cd C:\RE.cipe\re.cipe
mkdir server
cd server
npm init -y
```

Expected output: `Wrote to .../server/package.json`

- [ ] **Step 2: Install all dependencies**

```bash
npm install express pg bcrypt jsonwebtoken cors dotenv
```

Expected output: `added X packages`

- [ ] **Step 3: Create `server/.env`**

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recipe_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=change_this_to_a_long_random_string_at_least_32_chars
CORS_ORIGIN=https://seriyspray.github.io
PORT=3000
```

> Replace `your_postgres_password` with your actual PostgreSQL password.
> Replace `JWT_SECRET` with any long random string (e.g., mash keyboard: `x7k2mQp9nRvLwZ4tYjB8sHcA1dEuFo5i`).

- [ ] **Step 4: Create `server/.gitignore`**

```
node_modules/
.env
```

- [ ] **Step 5: Commit**

```bash
cd ..
git add server/package.json server/package-lock.json server/.gitignore
git commit -m "feat: initialize server project with dependencies"
```

---

## Task 2: Create the database schema

**Files:**
- Create: `server/schema.sql`

- [ ] **Step 1: Create `server/schema.sql`**

```sql
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  TEXT,
  color_scheme  TEXT DEFAULT 'green',
  ascii_art     TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipes (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  difficulty  INT,
  cook_time   INT,
  share_token TEXT UNIQUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id   SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id     INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id INT NOT NULL REFERENCES ingredients(id),
  quantity      TEXT,
  unit          TEXT,
  PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS folders (
  id      SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS folder_recipes (
  folder_id INT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  recipe_id INT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  PRIMARY KEY (folder_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  UNIQUE (user_id, week_start)
);

CREATE TABLE IF NOT EXISTS meal_slots (
  id           SERIAL PRIMARY KEY,
  meal_plan_id INT NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
  recipe_id    INT NOT NULL REFERENCES recipes(id),
  day_of_week  INT  NOT NULL,
  meal_type    TEXT NOT NULL
);
```

- [ ] **Step 2: Open psql and create the database**

```bash
psql -U postgres
```

Inside psql:
```sql
CREATE DATABASE recipe_db;
\c recipe_db
\i C:/RE.cipe/re.cipe/server/schema.sql
\dt
```

Expected output from `\dt`:
```
          List of relations
 Schema |       Name         | Type  |  Owner
--------+--------------------+-------+----------
 public | folder_recipes     | table | postgres
 public | folders            | table | postgres
 public | ingredients        | table | postgres
 public | meal_plans         | table | postgres
 public | meal_slots         | table | postgres
 public | recipe_ingredients | table | postgres
 public | recipes            | table | postgres
 public | users              | table | postgres
```

- [ ] **Step 3: Commit**

```bash
git add server/schema.sql
git commit -m "feat: add PostgreSQL schema for users, recipes, folders, planner"
```

---

## Task 3: Create the database connection module

**Files:**
- Create: `server/db.js`

- [ ] **Step 1: Create `server/db.js`**

```js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
```

- [ ] **Step 2: Test the connection manually**

Create a temporary file `server/test-db.js`:

```js
const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection failed:', err.message);
  } else {
    console.log('Connected! Server time:', res.rows[0].now);
  }
  pool.end();
});
```

Run it:
```bash
cd server
node test-db.js
```

Expected output:
```
Connected! Server time: 2026-04-30T...
```

- [ ] **Step 3: Delete the test file and commit**

```bash
del test-db.js
cd ..
git add server/db.js
git commit -m "feat: add pg connection pool"
```

---

## Task 4: Create the Express server entry point

**Files:**
- Create: `server/server.js`

- [ ] **Step 1: Create `server/server.js`**

```js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Routes registered in Task 11 — placeholder to verify server starts
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 2: Start the server and test the health endpoint**

```bash
cd server
node server.js
```

In a second terminal:
```bash
curl http://localhost:3000/api/health
```

Expected output:
```json
{"status":"ok"}
```

Stop the server with `Ctrl+C`.

- [ ] **Step 3: Commit**

```bash
cd ..
git add server/server.js
git commit -m "feat: add Express server with CORS and health endpoint"
```

---

## Task 5: Create the JWT auth middleware

**Files:**
- Create: `server/middleware/auth.js`

- [ ] **Step 1: Create the middleware directory and file**

```bash
mkdir server\middleware
```

Create `server/middleware/auth.js`:

```js
const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1]; // "Bearer <token>" → take the second part
  if (!token) return res.status(401).json({ error: 'Malformed authorization header' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add server/middleware/auth.js
git commit -m "feat: add JWT auth middleware"
```

---

## Task 6: Create auth routes (register + login)

**Files:**
- Create: `server/routes/auth.js`

- [ ] **Step 1: Create the routes directory and `server/routes/auth.js`**

```bash
mkdir server\routes
```

Create `server/routes/auth.js`:

```js
const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const pool    = require('../db');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, color_scheme, created_at`,
      [email, passwordHash, display_name || null]
    );
    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password_hash, ...safeUser } = user; // never send the hash to the client
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```

- [ ] **Step 2: Mount the route in `server/server.js`**

Replace the placeholder `app.get('/api/health', ...)` block with:

```js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Test register**

Start server: `node server.js`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"secret123\",\"display_name\":\"Tester\"}"
```

Expected output:
```json
{
  "user": { "id": 1, "email": "test@test.com", "display_name": "Tester", ... },
  "token": "eyJ..."
}
```

- [ ] **Step 4: Test login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"secret123\"}"
```

Expected: same shape — `user` object + `token`.

- [ ] **Step 5: Test wrong password**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"wrong\"}"
```

Expected: `{"error":"Invalid credentials"}` with HTTP 401.

- [ ] **Step 6: Commit**

```bash
git add server/routes/auth.js server/server.js
git commit -m "feat: add register and login endpoints"
```

---

## Task 7: Create recipe routes

**Files:**
- Create: `server/routes/recipes.js`

- [ ] **Step 1: Create `server/routes/recipes.js`**

```js
const express = require('express');
const crypto  = require('crypto');
const pool    = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

// Reusable query that fetches a recipe with its ingredients as a JSON array
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

// GET /api/recipes/share/:token — public recipe (no auth required)
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

// PUT /api/recipes/:id — update recipe fields (not ingredients)
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
```

- [ ] **Step 2: Mount the route in `server/server.js`**

Add after the auth line:
```js
app.use('/api/recipes', require('./routes/recipes'));
```

- [ ] **Step 3: Test creating a recipe**

Copy the token from Task 6 Step 3, then:
```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"title\":\"Pasta Carbonara\",\"difficulty\":3,\"cook_time\":30,\"ingredients\":[{\"name\":\"pasta\",\"quantity\":\"200\",\"unit\":\"g\"},{\"name\":\"eggs\",\"quantity\":\"2\",\"unit\":\"pcs\"}]}"
```

Expected: `{"id":1,"title":"Pasta Carbonara",...}`

- [ ] **Step 4: Test listing recipes**

```bash
curl http://localhost:3000/api/recipes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected: array containing the recipe with `ingredients` array.

- [ ] **Step 5: Commit**

```bash
git add server/routes/recipes.js server/server.js
git commit -m "feat: add recipe CRUD and share token endpoints"
```

---

## Task 8: Create folder routes

**Files:**
- Create: `server/routes/folders.js`

- [ ] **Step 1: Create `server/routes/folders.js`**

```js
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
```

- [ ] **Step 2: Mount in `server/server.js`**

```js
app.use('/api/folders', require('./routes/folders'));
```

- [ ] **Step 3: Test**

```bash
curl -X POST http://localhost:3000/api/folders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Pasta dishes\"}"
```

Expected: `{"id":1,"user_id":1,"name":"Pasta dishes"}`

- [ ] **Step 4: Commit**

```bash
git add server/routes/folders.js server/server.js
git commit -m "feat: add folder routes"
```

---

## Task 9: Create planner routes

**Files:**
- Create: `server/routes/planner.js`

- [ ] **Step 1: Create `server/routes/planner.js`**

```js
const express = require('express');
const pool    = require('../db');
const auth    = require('../middleware/auth');

const router = express.Router();

// Returns the ISO date string (YYYY-MM-DD) for Monday of the current week
function getMondayOfCurrentWeek() {
  const now  = new Date();
  const day  = now.getDay();                          // 0=Sun, 1=Mon … 6=Sat
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // shift to Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];          // "2026-04-27"
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

// PUT /api/planner — save (replace) the current week's plan
// Body: { week_start: "2026-04-27", slots: [{ recipe_id, day_of_week, meal_type }] }
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

// GET /api/planner/shopping — ingredient list for the current week
router.get('/shopping', auth, async (req, res) => {
  const weekStart = getMondayOfCurrentWeek();
  try {
    const { rows } = await pool.query(
      `SELECT i.name AS ingredient, ri.quantity, ri.unit, r.title AS recipe
       FROM meal_plans mp
       JOIN meal_slots ms      ON mp.id = ms.meal_plan_id
       JOIN recipe_ingredients ri ON ms.recipe_id = ri.recipe_id
       JOIN ingredients i      ON ri.ingredient_id = i.id
       JOIN recipes r          ON ms.recipe_id = r.id
       WHERE mp.user_id=$1 AND mp.week_start=$2
       ORDER BY i.name`,
      [req.user.id, weekStart]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```

- [ ] **Step 2: Mount in `server/server.js`**

```js
app.use('/api/planner', require('./routes/planner'));
```

- [ ] **Step 3: Commit**

```bash
git add server/routes/planner.js server/server.js
git commit -m "feat: add meal planner and shopping list endpoints"
```

---

## Task 10: Create ingredients route

**Files:**
- Create: `server/routes/ingredients.js`

- [ ] **Step 1: Create `server/routes/ingredients.js`**

```js
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
```

- [ ] **Step 2: Mount in `server/server.js`**

The final `server/server.js` should look like this:

```js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/recipes',     require('./routes/recipes'));
app.use('/api/folders',     require('./routes/folders'));
app.use('/api/planner',     require('./routes/planner'));
app.use('/api/ingredients', require('./routes/ingredients'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 3: Final smoke test — restart server and hit every route**

```bash
node server.js
```

```bash
# Health
curl http://localhost:3000/api/health

# Ingredients (uses token from Task 6)
curl http://localhost:3000/api/ingredients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Planner
curl http://localhost:3000/api/planner \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

All three should return valid JSON.

- [ ] **Step 4: Commit**

```bash
git add server/routes/ingredients.js server/server.js
git commit -m "feat: add ingredients route and finalize server routing"
```

---

## Task 11: Write DATABASE_EXPLAINED.md

**Files:**
- Create: `server/DATABASE_EXPLAINED.md`

- [ ] **Step 1: Create `server/DATABASE_EXPLAINED.md` with the full content below**

````markdown
# RE.cipe — Database & Backend Explained

> Everything explained from scratch. Assumes zero prior knowledge.

---

## What is a Database?

A database is a place to store data that persists even after you close your program. Without a database, all data lives only in memory (RAM) and disappears when the program stops.

Think of it like this:
- **Variables in JavaScript** → data exists only while the program runs
- **A file on disk** → data persists, but hard to search or update
- **A database** → data persists AND you can search, filter, sort, and update it efficiently

---

## What is PostgreSQL?

PostgreSQL (often called "Postgres") is a **relational database management system (RDBMS)**. It stores data in **tables** — exactly like spreadsheet tabs, with rows and columns.

```
TABLE: users
┌────┬───────────────────┬──────────────┬──────────────┐
│ id │ email             │ display_name │ color_scheme │
├────┼───────────────────┼──────────────┼──────────────┤
│  1 │ alice@example.com │ Alice        │ green        │
│  2 │ bob@example.com   │ Bob          │ amber        │
└────┴───────────────────┴──────────────┴──────────────┘
```

"Relational" means tables can be **linked to each other**. A `recipes` row can point to a `users` row via `user_id`. This is a **foreign key** — a column in one table that references the primary key of another table.

---

## What is SQL?

SQL (Structured Query Language) is the language used to talk to a relational database. Every interaction with PostgreSQL — reading, writing, updating, deleting — is done with SQL.

The four fundamental operations:

```sql
-- Read rows
SELECT * FROM users WHERE id = 1;

-- Insert a new row
INSERT INTO users (email, display_name) VALUES ('alice@test.com', 'Alice');

-- Update an existing row
UPDATE users SET color_scheme = 'cyan' WHERE id = 1;

-- Delete a row
DELETE FROM users WHERE id = 1;
```

**`$1`, `$2`, `$3` — parameterized queries**

When writing SQL in Node.js, never insert variables directly into the string:
```js
// DANGEROUS — SQL injection attack possible
`SELECT * FROM users WHERE email = '${userInput}'`

// SAFE — parameterized query
pool.query('SELECT * FROM users WHERE email = $1', [userInput])
```

PostgreSQL replaces `$1` with the first value in the array, safely escaping it. This is the only way we write queries in this project.

---

## What is a Connection Pool? (`db.js`)

Every time your Node.js code needs to run a SQL query, it must connect to PostgreSQL. Opening a connection takes time (~50ms). If you opened and closed a new connection for every single request, your server would be slow.

A **connection pool** is a set of connections that stay open and are reused:

```
Request 1 → borrows connection A → runs query → returns connection A
Request 2 → borrows connection A → runs query → returns connection A
Request 3 → borrows connection B → runs query → returns connection B
```

**`db.js` — line by line:**

```js
require('dotenv').config();
```
Loads the `.env` file and puts its values into `process.env`. Without this line, `process.env.DB_HOST` would be `undefined`.

```js
const { Pool } = require('pg');
```
`pg` is the official Node.js driver for PostgreSQL. `Pool` is a class that manages multiple reusable connections. (The alternative `Client` creates a single connection — used only for transactions.)

```js
const pool = new Pool({
  host:     process.env.DB_HOST,     // e.g. "localhost"
  port:     process.env.DB_PORT,     // e.g. 5432
  database: process.env.DB_NAME,     // e.g. "recipe_db"
  user:     process.env.DB_USER,     // e.g. "postgres"
  password: process.env.DB_PASSWORD,
});
```
Creates the pool. The pool does NOT connect immediately — it connects on demand when the first query runs.

```js
module.exports = pool;
```
Exports the pool so every route file can `require('../db')` and share the same pool instance. Node.js caches `require()` results, so this is always the exact same object.

---

## What are Environment Variables? (`.env`)

Environment variables are configuration values that live outside your code — in a `.env` file or in the operating system.

**Why not hardcode values?**
```js
// BAD — password is visible in git history forever
const pool = new Pool({ password: 'my_secret_password' });

// GOOD — password stays out of the codebase
const pool = new Pool({ password: process.env.DB_PASSWORD });
```

The `.env` file is listed in `.gitignore` so it is never committed.

**`dotenv`** reads the `.env` file and loads each line into `process.env`:
```
DB_PASSWORD=hello123  →  process.env.DB_PASSWORD === 'hello123'
```

---

## What is Express? (`server.js`)

Express is a minimal Node.js framework for handling HTTP requests. Without it you would have to write raw Node.js `http.createServer()` code with manual URL parsing.

**`server.js` — line by line:**

```js
require('dotenv').config();
```
Must be the very first line — loads `.env` before anything else reads `process.env`.

```js
const app = express();
```
Creates the Express application object. This is the central object everything attaches to.

```js
app.use(cors({ origin: process.env.CORS_ORIGIN }));
```
See the CORS section below. `app.use()` registers **middleware** — functions that run on every request before the route handler.

```js
app.use(express.json());
```
Built-in Express middleware. Reads the raw request body and parses it as JSON, making it available as `req.body`. Without this, `req.body` would be `undefined`.

```js
app.use('/api/auth', require('./routes/auth'));
```
Mounts the auth router. All routes defined inside `routes/auth.js` will be accessible at `/api/auth/...`. For example, a `router.post('/login', ...)` inside that file becomes `POST /api/auth/login`.

```js
app.listen(PORT, () => { ... });
```
Starts the HTTP server. The callback runs once when the server is ready.

---

## What is CORS?

**Same-Origin Policy** is a browser security rule: JavaScript on `https://site-a.com` is blocked from making `fetch()` requests to `https://site-b.com`. This prevents malicious websites from reading your data from other sites.

Our setup:
- Frontend: `https://seriyspray.github.io` (GitHub Pages)
- Backend: `http://localhost:3000`

These are different origins → the browser blocks the request by default.

**CORS** (Cross-Origin Resource Sharing) is the server's way of saying "I allow requests from this specific origin."

```js
app.use(cors({ origin: process.env.CORS_ORIGIN }));
// CORS_ORIGIN = "https://seriyspray.github.io"
```

The `cors` middleware adds an HTTP header to every response:
```
Access-Control-Allow-Origin: https://seriyspray.github.io
```

The browser sees this header and allows the request.

**Why `process.env.CORS_ORIGIN`?** In local development you might want to allow `http://localhost:5500` too. Keeping it in `.env` makes it easy to change without touching code.

---

## What is bcrypt? (Password hashing)

You must never store passwords as plain text. If your database is ever leaked, all user passwords are exposed.

**Hashing** converts a password into a fixed-length string that cannot be reversed:
```
"secret123"  →  "$2b$10$X8k2mQp9nRvLwZ4tYjB..."
```

**Why you can't just use SHA256:**
SHA256 is fast — an attacker can try billions of guesses per second. bcrypt is intentionally slow (the `10` in `bcrypt.hash(password, 10)` is the "cost factor" — it means perform 2^10 = 1024 rounds of hashing). This makes brute-force attacks impractical.

**`routes/auth.js` — hashing and comparing:**

```js
const passwordHash = await bcrypt.hash(password, 10);
```
On registration — hash the plain password before storing it.

```js
const valid = await bcrypt.compare(password, user.password_hash);
```
On login — compare the plain password the user typed against the stored hash. bcrypt knows how to do this comparison correctly even though the hash is irreversible.

---

## What is a JWT? (Authentication tokens)

After a user logs in, the server needs a way to identify them on future requests. The classic approach is **sessions** (the server remembers you). JWT (JSON Web Token) is the stateless alternative — the token itself carries the information.

**Structure — three parts separated by dots:**
```
eyJhbGciOiJIUzI1NiJ9   ← Header (algorithm used)
.
eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0   ← Payload (your data)
.
xK8m2QpRvLwZ4tYjB8sHcA   ← Signature (proves it wasn't tampered with)
```

The payload is just **base64-encoded JSON** — not encrypted, anyone can decode it:
```json
{ "id": 1, "email": "test@test.com", "iat": 1714483200, "exp": 1715088000 }
```

The signature is created using `JWT_SECRET`. If someone changes the payload, the signature no longer matches — the server rejects it.

**`routes/auth.js` — creating a token:**
```js
const token = jwt.sign(
  { id: user.id, email: user.email },  // payload — what to store
  process.env.JWT_SECRET,              // secret key for signing
  { expiresIn: '7d' }                  // token becomes invalid after 7 days
);
```

**`middleware/auth.js` — verifying a token:**
```js
const header = req.headers.authorization; // "Bearer eyJ..."
const token  = header.split(' ')[1];       // take the part after "Bearer "
req.user = jwt.verify(token, process.env.JWT_SECRET);
// If valid → req.user = { id: 1, email: "...", iat: ..., exp: ... }
// If invalid/expired → throws an error → we return 401
```

**How the frontend uses it:**
```js
// After login, save the token
localStorage.setItem('token', data.token);

// On every API request, send it in the header
fetch('/api/recipes', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
});
```

---

## What is Express Middleware? (`middleware/auth.js`)

Middleware is a function that runs between receiving a request and sending a response. It has three parameters: `req`, `res`, `next`.

```js
module.exports = function authMiddleware(req, res, next) {
  // ... verify token ...
  req.user = jwt.verify(token, process.env.JWT_SECRET);
  next(); // pass control to the next handler
};
```

`next()` means "I'm done, continue to the actual route handler."

Routes that require authentication use it like this:
```js
router.get('/', auth, async (req, res) => {
  // auth middleware ran first, so req.user is available here
  const userId = req.user.id;
});
```

---

## What is a Database Transaction? (`routes/recipes.js`)

Some operations require multiple SQL queries that must all succeed or all fail together. Example: creating a recipe AND its ingredients.

If the recipe inserts successfully but the ingredient insert fails halfway through, you'd have a recipe with missing ingredients — corrupted data.

A **transaction** wraps multiple queries in an atomic unit:

```js
const client = await pool.connect(); // borrow a dedicated connection
try {
  await client.query('BEGIN');        // start transaction

  await client.query('INSERT INTO recipes ...');
  await client.query('INSERT INTO ingredients ...');
  await client.query('INSERT INTO recipe_ingredients ...');

  await client.query('COMMIT');       // save everything
} catch {
  await client.query('ROLLBACK');     // undo everything if any step failed
} finally {
  client.release();                   // return connection to pool
}
```

`BEGIN` / `COMMIT` / `ROLLBACK` are the three SQL transaction commands.

`client.release()` in `finally` ensures the connection is always returned to the pool, even if an error occurred.

---

## How Data Flows Through the App

### Registration

```
Browser                    Node.js server              PostgreSQL
  │                               │                         │
  │  POST /api/auth/register      │                         │
  │  { email, password, name }    │                         │
  │──────────────────────────────▶│                         │
  │                               │  bcrypt.hash(password)  │
  │                               │  INSERT INTO users...   │
  │                               │────────────────────────▶│
  │                               │◀────────────────────────│
  │                               │  { id: 1, email: ... }  │
  │                               │  jwt.sign({ id: 1 })    │
  │◀──────────────────────────────│                         │
  │  { user: {...}, token: "eyJ"} │                         │
  │  localStorage.setItem(token)  │                         │
```

### Fetching recipes (authenticated)

```
Browser                    Node.js server              PostgreSQL
  │                               │                         │
  │  GET /api/recipes             │                         │
  │  Authorization: Bearer eyJ... │                         │
  │──────────────────────────────▶│                         │
  │                               │  jwt.verify(token)      │
  │                               │  req.user = { id: 1 }   │
  │                               │  SELECT recipes WHERE   │
  │                               │  user_id = 1            │
  │                               │────────────────────────▶│
  │                               │◀────────────────────────│
  │                               │  [{ id:1, title:... }]  │
  │◀──────────────────────────────│                         │
  │  [{ id:1, title:...,          │                         │
  │     ingredients: [...] }]     │                         │
```

---

## Route Reference

| Method | Path | Auth | What it does |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account → returns JWT |
| POST | `/api/auth/login` | No | Verify credentials → returns JWT |
| GET | `/api/recipes` | Yes | All user's recipes with ingredients |
| POST | `/api/recipes` | Yes | Create recipe + insert ingredients |
| GET | `/api/recipes/:id` | Yes | One recipe |
| PUT | `/api/recipes/:id` | Yes | Update recipe fields |
| DELETE | `/api/recipes/:id` | Yes | Delete recipe (cascades to ingredients) |
| POST | `/api/recipes/:id/share` | Yes | Generate public share token |
| GET | `/api/recipes/share/:token` | No | View recipe by share token |
| GET | `/api/folders` | Yes | List folders |
| POST | `/api/folders` | Yes | Create folder |
| POST | `/api/folders/:id/recipes` | Yes | Add recipe to folder |
| DELETE | `/api/folders/:id/recipes/:rid` | Yes | Remove recipe from folder |
| GET | `/api/planner` | Yes | Current week's meal plan + slots |
| PUT | `/api/planner` | Yes | Save meal plan (replaces existing) |
| GET | `/api/planner/shopping` | Yes | Ingredient list for the current week |
| GET | `/api/ingredients` | Yes | All unique ingredients across user's recipes |

---

## How to Start the Server

```bash
cd re.cipe/server
node server.js
```

The server listens on `http://localhost:3000`. Keep this terminal open while using the app. Stop it with `Ctrl+C`.

---

## Quick Reference

| Concept | File | What it does |
|---------|------|-------------|
| Connection pool | `db.js` | One shared set of PostgreSQL connections |
| Environment variables | `.env` + `dotenv` | Secrets outside of code |
| Password hashing | `routes/auth.js` | `bcrypt.hash` on register, `bcrypt.compare` on login |
| JWT creation | `routes/auth.js` | `jwt.sign` → token sent to browser |
| JWT verification | `middleware/auth.js` | `jwt.verify` → `req.user` set for route handlers |
| CORS | `server.js` | Allows `fetch()` from GitHub Pages to localhost |
| Parameterized queries | All routes | `$1`, `$2` prevent SQL injection |
| Transactions | `routes/recipes.js` | `BEGIN` / `COMMIT` / `ROLLBACK` for multi-step writes |
````

- [ ] **Step 2: Commit**

```bash
cd ..
git add server/DATABASE_EXPLAINED.md
git commit -m "docs: add DATABASE_EXPLAINED.md with beginner-friendly backend documentation"
```

---

## Final State

After all tasks are complete the project structure is:

```
re.cipe/
├── index.html
├── auth.html
├── app.html
├── styles.css
├── main.js
├── docs/superpowers/
│   ├── specs/2026-04-30-database-design.md
│   └── plans/2026-04-30-database-implementation.md
└── server/
    ├── .env                    ← not in git
    ├── .gitignore
    ├── package.json
    ├── server.js
    ├── db.js
    ├── schema.sql
    ├── DATABASE_EXPLAINED.md
    ├── middleware/
    │   └── auth.js
    └── routes/
        ├── auth.js
        ├── recipes.js
        ├── folders.js
        ├── planner.js
        └── ingredients.js
```

Start the server with `node server.js` from the `server/` directory. The frontend makes requests to `http://localhost:3000/api/...`.
