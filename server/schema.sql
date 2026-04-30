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
