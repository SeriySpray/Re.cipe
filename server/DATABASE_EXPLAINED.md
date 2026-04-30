# RE.cipe — Database & Backend Explained

> Everything explained from scratch. Assumes zero prior knowledge.

---

## What is a Database?

A database is a place to store data that persists even after you close your program. Without a database, all data lives only in memory (RAM) and disappears when the program stops.

Think of it like this:

| Storage type | Persists after closing? | Easy to search? |
|---|---|---|
| JavaScript variable | No | No |
| File on disk | Yes | Hard |
| Database | Yes | Yes — built for it |

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

"Relational" means tables can be **linked to each other**. A `recipes` row can point to a `users` row via a `user_id` column. This link is called a **foreign key** — a column in one table that references the primary key of another table.

```
users.id ← referenced by → recipes.user_id
```

If you delete the user with `id = 1`, all their recipes are automatically deleted too. This is what `ON DELETE CASCADE` does in `schema.sql`.

---

## What is SQL?

SQL (Structured Query Language) is the language used to talk to a relational database. Every interaction with PostgreSQL is done with SQL.

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

**`*` in SELECT** means "all columns". You can also name specific columns:

```sql
SELECT id, email FROM users;  -- only returns id and email
```

**`WHERE`** filters which rows to affect — like an `if` statement for data.

---

## Parameterized Queries — The Only Safe Way to Write SQL

When writing SQL in Node.js, **never** insert variables directly into the string:

```js
// DANGEROUS — SQL injection attack is possible
const email = req.body.email;
pool.query(`SELECT * FROM users WHERE email = '${email}'`);

// What if email = "' OR '1'='1" ?
// The query becomes: SELECT * FROM users WHERE email = '' OR '1'='1'
// This returns ALL users — a security breach
```

Always use **parameterized queries** instead:

```js
// SAFE — PostgreSQL handles escaping automatically
pool.query('SELECT * FROM users WHERE email = $1', [email]);
```

PostgreSQL replaces `$1` with the first value in the array, `$2` with the second, and so on — safely escaping any special characters. This is the only way queries are written in this project.

---

## `schema.sql` — How the Database is Structured

`schema.sql` contains all the `CREATE TABLE` instructions. You run it once when setting up the database. `IF NOT EXISTS` means it's safe to run again — it won't recreate tables that already exist.

**`SERIAL PRIMARY KEY`**
`SERIAL` means PostgreSQL automatically assigns the next integer (1, 2, 3…) every time a new row is inserted. You never set `id` manually. `PRIMARY KEY` means this column uniquely identifies each row — no two rows can have the same `id`.

**`TEXT UNIQUE NOT NULL`**
- `TEXT` — any length string
- `UNIQUE` — no two rows can have the same value in this column
- `NOT NULL` — this column must always have a value; inserting a row without it is an error

**`REFERENCES users(id) ON DELETE CASCADE`**
This is a foreign key. It means:
1. The value in this column must exist as an `id` in the `users` table
2. `ON DELETE CASCADE` — if the referenced user is deleted, this row is deleted automatically

**`PRIMARY KEY (recipe_id, ingredient_id)`** in `recipe_ingredients`
A **composite primary key** — the combination of both columns must be unique. This prevents the same ingredient from being added to the same recipe twice.

**`UNIQUE (user_id, week_start)`** in `meal_plans`
Each user can have only one meal plan per week. This constraint enforces that automatically.

---

## `db.js` — The Connection Pool

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

**Why a pool instead of a single connection?**

Every time your code needs to run a SQL query, it must connect to PostgreSQL. Opening a connection takes time (~50ms). If you opened and closed a new connection for every request, your server would be slow and wasteful.

A **connection pool** keeps several connections open and reuses them:

```
Request A → borrows connection 1 → runs query → returns connection 1
Request B → borrows connection 1 → runs query → returns connection 1
Request C → borrows connection 2 → runs query → returns connection 2
```

**`require('dotenv').config()`**
This must run before the `new Pool(...)` call. It reads the `.env` file and loads every line into `process.env`. Without it, `process.env.DB_HOST` would be `undefined` and the connection would fail.

**`module.exports = pool`**
Exports the pool so every route file can do `const pool = require('../db')`. Node.js caches the result of `require()`, so all files share the exact same pool instance — not separate pools.

---

## `.env` — Environment Variables

Environment variables are configuration values that live outside your code — in a `.env` file.

**Why not just hardcode values?**
```js
// BAD — your password is now in git history forever
const pool = new Pool({ password: 'my_real_password' });

// GOOD — password stays out of the codebase entirely
const pool = new Pool({ password: process.env.DB_PASSWORD });
```

The `.env` file is listed in `.gitignore` so it is never committed to git. Each developer has their own copy with their own credentials.

**`dotenv`** reads the `.env` file line by line:
```
DB_PASSWORD=hello123  →  process.env.DB_PASSWORD === 'hello123'
JWT_SECRET=abc123     →  process.env.JWT_SECRET === 'abc123'
```

---

## `server.js` — The Express Entry Point

```js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/recipes',     require('./routes/recipes'));
// ...

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

**`express()`**
Creates the Express application object. Everything — middleware, routes, the server itself — attaches to this one object.

**`app.use(middleware)`**
Registers **middleware** — functions that run on every request before the route handler gets it. Order matters: middleware runs top to bottom.

**`express.json()`**
Built-in Express middleware. Reads the raw request body and parses it as JSON, making it available as `req.body`. Without this line, `req.body` would be `undefined` for every POST request.

**`app.use('/api/auth', require('./routes/auth'))`**
Mounts a router. All routes defined in `routes/auth.js` become accessible at `/api/auth/...`. A `router.post('/login', ...)` inside that file becomes `POST /api/auth/login`.

**`app.listen(PORT, callback)`**
Starts the HTTP server. The callback runs once when the server is ready to accept connections.

---

## What is CORS?

**Same-Origin Policy** is a browser security rule: JavaScript on `https://site-a.com` is blocked from making `fetch()` requests to `https://site-b.com`. This prevents malicious websites from reading your data from other sites.

Our setup has two different origins:
- Frontend: `https://seriyspray.github.io`
- Backend: `http://localhost:3000`

The browser sees these as different origins and blocks the request by default.

**CORS** (Cross-Origin Resource Sharing) is the server's way of saying "I allow requests from this specific origin."

```js
app.use(cors({ origin: process.env.CORS_ORIGIN }));
```

The `cors` middleware adds an HTTP response header:
```
Access-Control-Allow-Origin: https://seriyspray.github.io
```

The browser reads this header and allows the request to proceed.

**For local development** (opening `index.html` directly or using Live Server on `localhost:5500`), you can temporarily change `CORS_ORIGIN=http://localhost:5500` in your `.env` file.

---

## `middleware/auth.js` — What is Middleware?

Middleware is a function that sits between receiving an HTTP request and sending the response. It takes three parameters: `req` (the request), `res` (the response), and `next` (a function to call when done).

```js
module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization; // "Bearer eyJ..."
  if (!header) return res.status(401).json({ error: 'No token provided' });

  const token = header.split(' ')[1]; // split "Bearer eyJ..." → take "eyJ..."
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); // token is valid — continue to the actual route handler
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    // no next() → request stops here
  }
};
```

**`req.headers.authorization`**
HTTP headers are key-value pairs sent with every request. The `Authorization` header is the standard way to send auth tokens. Our frontend sends it as `Bearer <token>`.

**`header.split(' ')[1]`**
`"Bearer eyJ...".split(' ')` → `["Bearer", "eyJ..."]` → `[1]` takes the second element.

**`jwt.verify(token, secret)`**
Checks that:
1. The token's signature matches (was created with our secret)
2. The token hasn't expired

If both pass, it returns the payload (`{ id: 1, email: "..." }`). If either fails, it throws an error.

**`req.user = ...`**
Attaches the decoded user data to the request object. All subsequent route handlers can read `req.user.id` to know who is making the request.

**`next()`**
Passes control to the next function in the chain. Without calling `next()`, the request hangs forever.

Routes use this middleware like this:
```js
router.get('/', auth, async (req, res) => {
  //            ↑ auth runs first, then this handler
  const userId = req.user.id; // set by auth middleware
});
```

---

## What is bcrypt? (`routes/auth.js`)

You must never store passwords as plain text. If your database is ever leaked, every user's password would be immediately readable.

**Hashing** converts a password into a fixed-length string that cannot be reversed:
```
"secret123"  →  "$2b$10$X8k2mQp9nRvLwZ4tYjB8sHcA..."
```

**Why not SHA256 or MD5?**
Those are fast — an attacker can try billions of guesses per second with modern hardware. `bcrypt` is intentionally slow. The `10` in `bcrypt.hash(password, 10)` is the **cost factor**: it means perform 2¹⁰ = 1024 internal rounds. This makes each guess take ~100ms — fast enough to not annoy your users, slow enough to make brute-force attacks take centuries.

**On registration:**
```js
const passwordHash = await bcrypt.hash(password, 10);
// Store passwordHash in the database — never store 'password' itself
```

**On login:**
```js
const valid = await bcrypt.compare(password, user.password_hash);
// bcrypt knows how to compare even though the hash is irreversible
// Returns true if the password matches, false if not
```

**`const { password_hash, ...safeUser } = user`**
Destructuring with the rest operator. Extracts `password_hash` into its own variable and puts everything else into `safeUser`. We send `safeUser` to the browser — never the hash.

---

## What is a JWT? (`routes/auth.js`)

After a user logs in, the server needs a way to identify them on future requests. **JWT** (JSON Web Token) is the standard way to do this without storing session data on the server.

**Structure — three parts separated by dots:**
```
eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0.xK8m2Qp...
└────────────────────┘ └─────────────────────────────────────────────┘ └────────┘
       Header                         Payload                           Signature
   (algorithm used)               (your data, base64)            (proves authenticity)
```

The payload is base64-encoded JSON — **not encrypted**, anyone can decode it:
```json
{ "id": 1, "email": "test@test.com", "iat": 1714483200, "exp": 1715088000 }
```

The **signature** is created using `JWT_SECRET`. If anyone changes even one character of the payload, the signature no longer matches — the server rejects the token. This is what makes JWTs tamper-proof.

**Creating a token:**
```js
const token = jwt.sign(
  { id: user.id, email: user.email },  // what to store inside the token
  process.env.JWT_SECRET,              // secret key used to sign it
  { expiresIn: '7d' }                  // token automatically expires in 7 days
);
```

**How the frontend stores and sends it:**
```js
// After login — save the token
localStorage.setItem('token', data.token);

// On every API request — send it in the Authorization header
fetch('http://localhost:3000/api/recipes', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
});
```

---

## What is a Database Transaction? (`routes/recipes.js`)

Some operations require multiple SQL queries that must all succeed or all fail together.

Example: creating a recipe requires:
1. `INSERT INTO recipes` — insert the recipe row
2. `INSERT INTO ingredients` — insert each ingredient (if new)
3. `INSERT INTO recipe_ingredients` — link recipe to ingredients

If step 1 succeeds but step 3 fails halfway, you'd have a recipe with missing ingredients — corrupted data.

A **transaction** wraps multiple queries in an atomic unit: either all succeed or none do.

```js
const client = await pool.connect(); // borrow a dedicated connection from the pool
try {
  await client.query('BEGIN');    // start the transaction

  await client.query('INSERT INTO recipes ...');
  await client.query('INSERT INTO ingredients ...');
  await client.query('INSERT INTO recipe_ingredients ...');

  await client.query('COMMIT');   // all succeeded — save permanently
} catch {
  await client.query('ROLLBACK'); // something failed — undo everything
} finally {
  client.release(); // always return the connection to the pool
}
```

**`BEGIN`** — marks the start of the transaction. All queries after this are held in a temporary state.

**`COMMIT`** — makes all the queued changes permanent.

**`ROLLBACK`** — undoes all changes since `BEGIN`, as if they never happened.

**`finally`** — this block runs whether the `try` succeeded or the `catch` fired. It ensures the connection is always returned to the pool, preventing connection leaks.

**`pool.connect()`** vs `pool.query()`**
- `pool.query()` — borrows a connection, runs one query, returns the connection automatically
- `pool.connect()` — borrows a connection and holds it until you call `client.release()`. Required for transactions because all queries in a transaction must use the same connection.

---

## `routes/recipes.js` — The RECIPE_WITH_INGREDIENTS Query

```js
const RECIPE_WITH_INGREDIENTS = `
  SELECT r.*,
    COALESCE(
      json_agg(
        json_build_object('id', i.id, 'name', i.name, 'quantity', ri.quantity, 'unit', ri.unit)
      ) FILTER (WHERE i.id IS NOT NULL),
      '[]'
    ) AS ingredients
  FROM recipes r
  LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
  LEFT JOIN ingredients i ON ri.ingredient_id = i.id
`;
```

This looks complex — let's break it down.

**`LEFT JOIN`**
Combines rows from two tables. `LEFT JOIN` means "include all rows from the left table (`recipes`) even if there's no matching row in the right table (`recipe_ingredients`)". A recipe with no ingredients still appears in the result.

**`json_build_object('id', i.id, 'name', i.name, ...)`**
Constructs a JSON object `{"id": 1, "name": "pasta", "quantity": "200", "unit": "g"}` directly in SQL.

**`json_agg(...)`**
Aggregates multiple JSON objects into a JSON array: `[{...}, {...}, {...}]`. Because of the JOIN, each recipe appears once per ingredient. `json_agg` collapses all ingredient rows for a recipe back into a single array.

**`FILTER (WHERE i.id IS NOT NULL)`**
Without this, a recipe with no ingredients would produce `[null]` (an array with one null element). The filter tells `json_agg` to skip rows where the ingredient is missing.

**`COALESCE(..., '[]')`**
`COALESCE` returns the first non-null argument. If `json_agg` returns `null` (no ingredients at all), this returns `'[]'` (an empty array string) instead.

**`GROUP BY r.id`**
Required whenever you use aggregate functions like `json_agg`. It groups all rows with the same `r.id` together before applying the aggregation.

---

## `routes/planner.js` — Shopping List Query

```sql
SELECT i.name AS ingredient, ri.quantity, ri.unit, r.title AS recipe
FROM meal_plans mp
JOIN meal_slots ms         ON mp.id = ms.meal_plan_id
JOIN recipe_ingredients ri ON ms.recipe_id = ri.recipe_id
JOIN ingredients i         ON ri.ingredient_id = i.id
JOIN recipes r             ON ms.recipe_id = r.id
WHERE mp.user_id=$1 AND mp.week_start=$2
ORDER BY i.name
```

This query walks the chain of relationships:

```
meal_plans → meal_slots → recipes → recipe_ingredients → ingredients
```

Reading it step by step:
1. Start with the user's meal plan for the current week (`WHERE mp.user_id=$1 AND mp.week_start=$2`)
2. Find all meal slots in that plan (`JOIN meal_slots`)
3. For each slot, find the recipe (`JOIN recipes`)
4. For each recipe, find its ingredients link (`JOIN recipe_ingredients`)
5. Resolve ingredient names (`JOIN ingredients`)
6. Return: ingredient name, quantity, unit, recipe title

The result is a flat list of everything needed to cook the meals planned for the current week.

---

## How Data Flows Through the App

### Registration

```
Browser                     Node.js (server.js)           PostgreSQL
  │                                │                           │
  │  POST /api/auth/register       │                           │
  │  { email, password, name }     │                           │
  │───────────────────────────────▶│                           │
  │                                │  bcrypt.hash(password)    │
  │                                │  INSERT INTO users...     │
  │                                │──────────────────────────▶│
  │                                │◀──────────────────────────│
  │                                │  { id:1, email:... }      │
  │                                │  jwt.sign({ id:1 })       │
  │◀───────────────────────────────│                           │
  │  { user: {...}, token: "eyJ" } │                           │
  │  localStorage.setItem(token)   │                           │
```

### Fetching Recipes (Authenticated)

```
Browser                     Node.js                       PostgreSQL
  │                                │                           │
  │  GET /api/recipes              │                           │
  │  Authorization: Bearer eyJ...  │                           │
  │───────────────────────────────▶│                           │
  │                             auth middleware                 │
  │                                │  jwt.verify(token)        │
  │                                │  req.user = { id: 1 }     │
  │                             route handler                   │
  │                                │  SELECT recipes WHERE     │
  │                                │  user_id = 1 + ingredients│
  │                                │──────────────────────────▶│
  │                                │◀──────────────────────────│
  │◀───────────────────────────────│                           │
  │  [{ id:1, title:"Carbonara",   │                           │
  │     ingredients:[...] }]       │                           │
```

### Creating a Recipe (Transaction)

```
Browser                     Node.js                       PostgreSQL
  │                                │                           │
  │  POST /api/recipes             │                           │
  │  { title, ingredients:[...] }  │                           │
  │───────────────────────────────▶│                           │
  │                                │  BEGIN                    │
  │                                │──────────────────────────▶│
  │                                │  INSERT INTO recipes      │
  │                                │──────────────────────────▶│
  │                                │  INSERT INTO ingredients  │
  │                                │──────────────────────────▶│
  │                                │  INSERT INTO recipe_ingr..│
  │                                │──────────────────────────▶│
  │                                │  COMMIT                   │
  │                                │──────────────────────────▶│
  │◀───────────────────────────────│                           │
  │  { id:1, title:"Carbonara" }   │                           │
```

---

## How to Start the Server

```bash
# Navigate to the server directory
cd re.cipe/server

# Start the server (keep this terminal open while using the app)
node server.js

# Expected output:
# Server running on http://localhost:3000
```

Stop with `Ctrl+C`.

Every time you restart your computer, you need to start the server again before the app works.

---

## Testing the API Without a Frontend

Use `curl` in the terminal to test any endpoint manually:

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"secret123\"}"
```

**Login (copy the token from the response):**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"secret123\"}"
```

**Get recipes (paste your token):**
```bash
curl http://localhost:3000/api/recipes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Quick Reference — All Files

| File | What it does | Key concept |
|------|-------------|-------------|
| `schema.sql` | Creates all database tables | SQL DDL, foreign keys, constraints |
| `db.js` | Shared PostgreSQL connection pool | `pg.Pool`, `dotenv` |
| `server.js` | Express app + middleware + routing | Express, CORS, middleware chain |
| `middleware/auth.js` | Verifies JWT on protected routes | JWT, `req.user`, `next()` |
| `routes/auth.js` | Register + login | bcrypt, JWT creation |
| `routes/recipes.js` | Recipe CRUD + share token | Transactions, JOIN, `json_agg` |
| `routes/folders.js` | Folder management | `ON CONFLICT DO NOTHING` |
| `routes/planner.js` | Meal plan + shopping list | Multi-table JOIN, upsert |
| `routes/ingredients.js` | List user's ingredients | `DISTINCT`, JOIN across 3 tables |

## Quick Reference — All Concepts

| Concept | Short explanation |
|---------|------------------|
| PostgreSQL | Database that stores data in tables, survives restarts |
| SQL | Language to read/write data (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) |
| Foreign key | Column that links to another table's primary key |
| `ON DELETE CASCADE` | Automatically delete child rows when parent is deleted |
| Parameterized query | `$1`, `$2` placeholders — prevents SQL injection |
| Connection pool | Reusable set of open DB connections — faster than reconnecting each time |
| Environment variable | Config value stored in `.env`, not in code |
| Express | Minimal Node.js HTTP framework — handles routing and middleware |
| Middleware | Function that runs before route handlers — used for auth, parsing, logging |
| CORS | Server permission that allows browsers on other origins to make fetch() requests |
| bcrypt | Password hashing — slow by design to prevent brute-force |
| JWT | Signed token that proves identity without server-side session storage |
| Transaction | `BEGIN` / `COMMIT` / `ROLLBACK` — multiple queries that succeed or fail together |
| `json_agg` | PostgreSQL function that collapses multiple rows into a JSON array |
| `COALESCE` | Returns first non-null argument — used as a fallback value |
