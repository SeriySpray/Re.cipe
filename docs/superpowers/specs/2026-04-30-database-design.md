# RE.cipe — Database Design Spec

> Date: 2026-04-30

---

## Overview

Add a PostgreSQL database and a minimal Node.js backend to RE.cipe. The frontend stays as vanilla HTML/CSS/JS hosted on GitHub Pages. The backend runs locally.

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Database | PostgreSQL (local) | Relational data, powerful JOIN queries, UNIQUE/FK constraints |
| Backend | Node.js + Express | Minimal, no framework overhead |
| DB client | `pg` (node-postgres) | Direct SQL, no ORM |
| Auth | JWT + `bcrypt` | Stateless, simple |
| CORS | `cors` middleware | Allow requests from GitHub Pages |

---

## Architecture

```
github.io/Re.cipe (GitHub Pages)
  → fetch() to localhost:3000

localhost:3000 (Node.js / Express)
  → SQL queries to localhost:5432

localhost:5432 (PostgreSQL)
  → recipe_db
```

---

## Database Schema

```sql
users (id, email, password_hash, display_name, color_scheme, ascii_art, created_at)
recipes (id, user_id→users, title, description, difficulty, cook_time, share_token, created_at)
ingredients (id, name UNIQUE)
recipe_ingredients (recipe_id→recipes, ingredient_id→ingredients, quantity, unit)
folders (id, user_id→users, name)
folder_recipes (folder_id→folders, recipe_id→recipes)
meal_plans (id, user_id→users, week_start DATE)
meal_slots (id, meal_plan_id→meal_plans, recipe_id→recipes, day_of_week INT, meal_type TEXT)
```

---

## API Routes

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/:id
PUT    /api/recipes/:id
DELETE /api/recipes/:id
GET    /api/recipes/share/:token

GET    /api/folders
POST   /api/folders
POST   /api/folders/:id/recipes
DELETE /api/folders/:id/recipes/:recipeId

GET    /api/planner
PUT    /api/planner
GET    /api/planner/shopping

GET    /api/ingredients
```

---

## File Structure

```
re.cipe/
├── index.html
├── auth.html
├── app.html
├── styles.css
├── main.js
└── server/
    ├── server.js
    ├── db.js
    ├── schema.sql
    ├── middleware/
    │   └── auth.js
    └── routes/
        ├── auth.js
        ├── recipes.js
        ├── folders.js
        ├── planner.js
        └── ingredients.js
```

---

## Documentation Requirements

All documentation must follow the style of the existing `CODEBASE_EXPLAINED.md`:
- Written for beginners with zero prior knowledge
- Every concept explained from first principles
- Code blocks followed by line-by-line explanations
- "Why" is always explained, not just "what"
- Cover: what PostgreSQL is, what SQL is, what a connection pool is, what JWTs are, what bcrypt is, what CORS is, and how each piece connects

The database documentation file: `server/DATABASE_EXPLAINED.md`

---

## Environment Variables (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recipe_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
CORS_ORIGIN=https://seriyspray.github.io
PORT=3000
```
