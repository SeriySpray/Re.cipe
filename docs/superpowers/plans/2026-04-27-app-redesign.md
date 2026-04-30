# App Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Замінити термінально-командну парадигму `app.html` на split-panel layout з формою зліва і master-detail переглядом рецептів справа.

**Architecture:** Три файли: `app.html` (markup), `app.js` (логіка форми + список + деталі + теми), `styles.css` (нові секції app-layout замість старих `.pane-*`). `commands.js` видаляється повністю. Дані зберігаються у `localStorage` під ключем `recipe-data` у тому самому форматі `[{name,ingredients,steps,time}]` — існуючі записи не ламаються.

**Tech Stack:** Vanilla HTML5, CSS3 (CSS variables, grid, flexbox), ES5 JavaScript, localStorage

---

## Файлова карта

| Файл | Дія |
|---|---|
| `re.cipe/app.html` | Повна заміна |
| `re.cipe/app.js` | Повна заміна |
| `re.cipe/commands.js` | Видалити |
| `re.cipe/styles.css` | Видалити секцію `/* ── App Page ──*/` і нижче (рядки 389–кінець); замінити новою секцією |

---

## Task 1: Видалити commands.js і очистити стару логіку

**Files:**
- Delete: `re.cipe/commands.js`
- Modify: `re.cipe/styles.css` — видалити всі app-специфічні стилі

- [ ] **Step 1: Видалити commands.js**

```bash
rm re.cipe/commands.js
```

- [ ] **Step 2: Видалити app-стилі з styles.css**

У `styles.css` знайти рядок `/* ── App Page ──*/` (~рядок 389) і видалити все від нього до кінця файлу. Зберегти файл.

- [ ] **Step 3: Перевірити у браузері**

Відкрити `re.cipe/app.html` у браузері. Сторінка буде зламана (немає разметки) — це очікувано. Консоль не повинна скаржитися на commands.js.

- [ ] **Step 4: Commit**

```bash
git -C re.cipe add -A
git -C re.cipe commit -m "chore: remove commands.js and old app styles"
```

---

## Task 2: Новий app.html

**Files:**
- Modify: `re.cipe/app.html`

- [ ] **Step 1: Замінити повністю вміст app.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RE.cipe — Workspace</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
  <script>
    (function () {
      var s = localStorage.getItem('recipe-theme');
      if (s && s !== 'green') document.body.setAttribute('data-theme', s);
    })();
  </script>
</head>
<body class="app-page">

  <nav class="navbar">
    <span class="logo">[RE.cipe]</span>
    <span class="nav-sep">/</span>
    <span class="nav-user" id="navUser">// guest</span>
    <div class="theme-swatches">
      <button class="swatch" data-theme-name="green"  style="background:#00ff88"></button>
      <button class="swatch" data-theme-name="amber"  style="background:#ffb300"></button>
      <button class="swatch" data-theme-name="cyan"   style="background:#00d4ff"></button>
      <button class="swatch" data-theme-name="rose"   style="background:#ff4d6d"></button>
      <button class="swatch" data-theme-name="violet" style="background:#a855f7"></button>
    </div>
    <button class="btn btn-ghost" id="btnLogout">&gt; logout</button>
  </nav>

  <div class="workspace">

    <!-- LEFT: ADD / EDIT RECIPE -->
    <div class="panel" id="formPanel">
      <div class="panel-bar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="panel-label" id="formPanelLabel">re.cipe — new_recipe</span>
      </div>

      <div class="form-scroll">
        <p class="form-comment">// fill in fields and press save</p>

        <div class="field">
          <label class="f-label" for="fName">name</label>
          <input class="f-input" id="fName" type="text"
                 autocomplete="off" spellcheck="false" placeholder="Carbonara" />
        </div>

        <div class="field">
          <label class="f-label" for="fIngredients">ingredients</label>
          <textarea class="f-input f-textarea" id="fIngredients"
                    autocomplete="off" spellcheck="false"
                    placeholder="eggs, bacon, pasta..."></textarea>
        </div>

        <div class="field">
          <label class="f-label" for="fSteps">steps</label>
          <textarea class="f-input f-textarea" id="fSteps"
                    autocomplete="off" spellcheck="false"
                    placeholder="boil pasta, fry bacon..."></textarea>
        </div>

        <div class="field">
          <label class="f-label" for="fTime">cook_time_min</label>
          <input class="f-input" id="fTime" type="number" min="1"
                 autocomplete="off" placeholder="25" />
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-save" id="btnSave">save_recipe</button>
        <button class="btn-clear" id="btnClear">clear</button>
      </div>

      <div class="panel-status">
        <span class="sdot"></span>
        <span id="formStatus">READY</span>
        <span class="panel-status-right">v0.2</span>
      </div>
    </div>

    <!-- RIGHT: RECIPES MASTER-DETAIL -->
    <div class="panel" id="recipesPanel">
      <div class="panel-bar">
        <span class="dot red"></span>
        <span class="dot yellow"></span>
        <span class="dot green"></span>
        <span class="panel-label" id="recipesPanelLabel">re.cipe — recipes (0)</span>
      </div>

      <div class="md-body">
        <div class="r-list" id="recipeList"></div>
        <div class="r-detail" id="recipeDetail">
          <div class="empty-state">
            <div class="empty-text">// no recipes yet</div>
            <div class="empty-sub">add one using the form</div>
          </div>
        </div>
      </div>

      <div class="panel-status">
        <span class="sdot"></span>
        <span id="recipesStatus">0 recipes</span>
        <span class="panel-status-right" id="recipesStatusRight">v0.2</span>
      </div>
    </div>

  </div>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Перевірити у браузері**

Відкрити `app.html`. Navbar повинен відображатися. Workspace буде без стилів (немає CSS ще). Консоль не повинна мати помилок (крім app.js — ще не замінено).

- [ ] **Step 3: Commit**

```bash
git -C re.cipe add app.html
git -C re.cipe commit -m "feat: new app.html split-panel markup"
```

---

## Task 3: CSS — app-layout секція у styles.css

**Files:**
- Modify: `re.cipe/styles.css` — додати в кінець файлу

- [ ] **Step 1: Додати app-layout CSS в кінець styles.css**

Відкрити `styles.css`. В кінець файлу (після останнього `@media` блоку) додати:

```css
/* ══════════════════════════════════════════
   App Page
═══════════════════════════════════════════ */

.app-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

.app-page::before {
  content: '';
  position: fixed; inset: 0;
  background-image: radial-gradient(circle, #ffffff05 1px, transparent 1px);
  background-size: 22px 22px;
  pointer-events: none;
  z-index: 0;
}

/* Navbar additions */
.nav-sep  { font-size: 11px; color: var(--muted); }
.nav-user { font-size: 11px; color: var(--dim); }

.theme-swatches { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.swatch {
  width: 11px; height: 11px; border-radius: 50%;
  border: 1.5px solid transparent;
  cursor: pointer; padding: 0;
  transition: border-color 0.15s, transform 0.15s;
}
.swatch:hover { transform: scale(1.3); }
.swatch.on    { border-color: rgba(255,255,255,0.6); }

/* Workspace */
.workspace {
  position: relative; z-index: 1;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 10px;
  padding: 10px;
  flex: 1;
  overflow: hidden;
  padding-top: 62px;
}

/* Panel chrome */
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  display: flex; flex-direction: column;
  overflow: hidden;
  position: relative; z-index: 1;
}

.panel-bar {
  display: flex; align-items: center; gap: 7px;
  padding: 0 14px; height: 36px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: rgba(0,0,0,0.3);
}
.panel-label { font-size: 10px; color: var(--muted); margin-left: 6px; letter-spacing: 0.04em; }

.panel-status {
  display: flex; align-items: center; gap: 8px;
  padding: 0 14px; height: 26px;
  border-top: 1px solid var(--border);
  font-size: 9px; color: var(--muted);
  flex-shrink: 0;
  background: rgba(0,0,0,0.25);
  letter-spacing: 0.06em;
}
.panel-status-right { margin-left: auto; }

.sdot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--accent);
  animation: sdot-pulse 2.5s ease-in-out infinite;
}
@keyframes sdot-pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }

/* Form */
.form-scroll {
  flex: 1; overflow-y: auto; padding: 14px;
  display: flex; flex-direction: column; gap: 8px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.form-scroll::-webkit-scrollbar { width: 3px; }
.form-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.form-comment { font-size: 9px; color: var(--dim); letter-spacing: 0.08em; }

.field {
  background: #111;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 13px;
  transition: border-color 0.15s;
  cursor: text;
}
.field.focused { border-color: var(--accent); }

.f-label {
  display: block;
  font-size: 8px; color: var(--dim);
  text-transform: uppercase; letter-spacing: 0.7px;
  margin-bottom: 5px;
  cursor: text;
}

.f-input {
  display: block; width: 100%;
  background: transparent; border: none; outline: none;
  font-family: var(--font); font-size: 12px;
  color: var(--text); caret-color: var(--accent);
  resize: none;
}
.f-input::placeholder { color: #252525; }

.f-textarea { min-height: 52px; line-height: 1.6; }

.form-actions {
  padding: 0 14px 12px;
  display: flex; gap: 7px; flex-shrink: 0;
}

.btn-save {
  flex: 1;
  background: var(--accent); color: #000;
  border: none; border-radius: 8px; padding: 10px;
  font-family: var(--font); font-size: 10px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}
.btn-save:hover  { opacity: 0.85; }
.btn-save:active { transform: scale(0.98); }

.btn-clear {
  background: transparent; color: var(--dim);
  border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 16px;
  font-family: var(--font); font-size: 10px;
  cursor: pointer; letter-spacing: 0.04em;
  transition: color 0.15s, border-color 0.15s;
}
.btn-clear:hover { color: var(--text); border-color: var(--dim); }

/* Master-Detail */
.md-body {
  flex: 1; display: grid;
  grid-template-columns: 180px 1fr;
  overflow: hidden;
}

.r-list {
  border-right: 1px solid var(--border);
  overflow-y: auto; padding: 8px 6px;
  display: flex; flex-direction: column; gap: 2px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.r-list::-webkit-scrollbar { width: 3px; }
.r-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.r-item {
  border-radius: 6px; padding: 8px 10px;
  cursor: pointer; border: 1px solid transparent;
  transition: background 0.12s;
}
.r-item:hover  { background: rgba(255,255,255,0.03); }
.r-item.active {
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  border-color: color-mix(in srgb, var(--accent) 20%, transparent);
}

.r-item-top { display: flex; align-items: baseline; margin-bottom: 2px; }
.r-prompt   { font-size: 9px; color: var(--dim); margin-right: 5px; flex-shrink: 0; }
.r-name     { font-size: 11px; font-weight: 700; color: var(--text); }
.r-time     { font-size: 9px; color: var(--muted); }

.r-item.active .r-prompt,
.r-item.active .r-name { color: var(--accent); }

.r-detail {
  padding: 16px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 10px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.r-detail::-webkit-scrollbar { width: 3px; }
.r-detail::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

.detail-head { padding-bottom: 10px; border-bottom: 1px solid var(--border); }
.detail-name { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 4px; letter-spacing: -0.02em; }
.detail-meta { font-size: 10px; color: var(--dim); }

.detail-block {
  background: #111; border: 1px solid var(--border);
  border-radius: 8px; padding: 11px 13px;
}
.detail-block .f-label { margin-bottom: 6px; }
.detail-val { font-size: 11px; color: var(--dim); line-height: 1.7; }

.detail-foot { margin-top: auto; display: flex; gap: 7px; }

.btn-edit {
  flex: 1; background: transparent; color: var(--dim);
  border: 1px solid var(--border); border-radius: 8px;
  padding: 8px; font-family: var(--font); font-size: 10px;
  cursor: pointer; letter-spacing: 0.04em;
  transition: color 0.15s, border-color 0.15s;
}
.btn-edit:hover { color: var(--text); border-color: var(--dim); }

.btn-del {
  background: transparent; color: var(--muted);
  border: 1px solid var(--border); border-radius: 8px;
  padding: 8px 14px; font-family: var(--font); font-size: 10px;
  cursor: pointer; letter-spacing: 0.04em;
  transition: color 0.15s, border-color 0.15s;
}
.btn-del:hover { color: #ff4d6d; border-color: rgba(255,77,109,0.3); }

/* Empty state */
.empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 4px;
}
.empty-text { font-size: 11px; color: var(--border); letter-spacing: 0.06em; }
.empty-sub  { font-size: 10px; color: var(--muted); }
```

- [ ] **Step 2: Перевірити у браузері**

Відкрити `app.html`. Navbar, ліва і права панелі повинні відображатися зі стилями. Форма і empty state мають бути видимі. JS ще не замінено — функціональності немає.

- [ ] **Step 3: Commit**

```bash
git -C re.cipe add styles.css
git -C re.cipe commit -m "feat: add app-layout CSS (panels, form, master-detail)"
```

---

## Task 4: app.js — дані, тема, авторизація

**Files:**
- Modify: `re.cipe/app.js` — повна заміна

- [ ] **Step 1: Замінити app.js на новий файл (частина 1 — data + theme + auth)**

```javascript
// ── Data ─────────────────────────────────────────────────────────

function loadRecipes() {
  try { return JSON.parse(localStorage.getItem('recipe-data') || '[]'); }
  catch (e) { return []; }
}

function saveRecipes(data) {
  localStorage.setItem('recipe-data', JSON.stringify(data));
}

// ── Helpers ───────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── State ─────────────────────────────────────────────────────────

var state = {
  recipes:     [],
  selectedIdx: -1,
  editIdx:     -1
};

// ── Theme ─────────────────────────────────────────────────────────

function initTheme() {
  var current = localStorage.getItem('recipe-theme') || 'green';
  updateSwatchActive(current);

  document.querySelectorAll('.swatch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.dataset.themeName;
      if (name === 'green') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', name);
      }
      localStorage.setItem('recipe-theme', name);
      updateSwatchActive(name);
    });
  });
}

function updateSwatchActive(name) {
  document.querySelectorAll('.swatch').forEach(function (btn) {
    btn.classList.toggle('on', btn.dataset.themeName === name);
  });
}

// ── Auth ──────────────────────────────────────────────────────────

function initAuth() {
  var username = localStorage.getItem('recipe-user') || 'guest';
  document.getElementById('navUser').textContent = '// ' + username;
  document.getElementById('recipesStatusRight').textContent = username + '  ·  v0.2';

  document.getElementById('btnLogout').addEventListener('click', function () {
    window.location.href = 'auth.html';
  });
}
```

- [ ] **Step 2: Перевірити у браузері**

Відкрити `app.html`. Консоль не повинна мати помилок. Navbar показує `// guest` (або збережений username). Swatch теми змінює акцент кольору одразу. Кнопка logout перенаправляє на `auth.html`.

- [ ] **Step 3: Commit**

```bash
git -C re.cipe add app.js
git -C re.cipe commit -m "feat: app.js data helpers, theme, auth init"
```

---

## Task 5: app.js — форма (додання рецепту)

**Files:**
- Modify: `re.cipe/app.js` — дописати нижче існуючого коду

- [ ] **Step 1: Дописати в app.js — логіку форми**

Додати після `initAuth`:

```javascript
// ── Form ─────────────────────────────────────────────────────────

function initForm() {
  document.querySelectorAll('.field').forEach(function (field) {
    var input = field.querySelector('.f-input');
    if (!input) return;
    input.addEventListener('focus', function () {
      document.querySelectorAll('.field').forEach(function (f) { f.classList.remove('focused'); });
      field.classList.add('focused');
    });
    input.addEventListener('blur', function () {
      field.classList.remove('focused');
    });
  });

  document.getElementById('btnSave').addEventListener('click', handleSave);
  document.getElementById('btnClear').addEventListener('click', handleClear);
}

function getFormValues() {
  return {
    name:        document.getElementById('fName').value.trim(),
    ingredients: document.getElementById('fIngredients').value.trim(),
    steps:       document.getElementById('fSteps').value.trim(),
    time:        document.getElementById('fTime').value.trim()
  };
}

function setFormValues(r) {
  document.getElementById('fName').value        = r.name        || '';
  document.getElementById('fIngredients').value = r.ingredients || '';
  document.getElementById('fSteps').value       = r.steps       || '';
  document.getElementById('fTime').value        = r.time        || '';
}

function clearForm() {
  setFormValues({ name: '', ingredients: '', steps: '', time: '' });
  document.querySelectorAll('.field').forEach(function (f) { f.classList.remove('focused'); });
  state.editIdx = -1;
  setFormMode('new');
}

function setFormMode(mode) {
  var isEdit = mode === 'edit';
  document.getElementById('formPanelLabel').textContent = isEdit
    ? 're.cipe — edit_recipe'
    : 're.cipe — new_recipe';
  document.getElementById('btnSave').textContent = isEdit
    ? 'update_recipe'
    : 'save_recipe';
  document.getElementById('formStatus').textContent = isEdit ? 'EDITING' : 'READY';
}

function handleSave() {
  var vals = getFormValues();
  if (!vals.name) { document.getElementById('fName').focus(); return; }

  var data = loadRecipes();

  if (state.editIdx >= 0) {
    data[state.editIdx] = vals;
  } else {
    data.push(vals);
  }

  saveRecipes(data);
  state.recipes = data;

  var selectIdx = state.editIdx >= 0 ? state.editIdx : data.length - 1;
  clearForm();
  renderList(selectIdx);
  renderDetail(selectIdx);
}

function handleClear() {
  clearForm();
}
```

- [ ] **Step 2: Перевірити у браузері**

Заповнити поле "name" (наприклад "Борщ") і натиснути `save_recipe`. Рецепт повинен з'явитися у правій панелі. Натиснути `clear` — форма очищується. Спробувати зберегти без назви — фокус повертається на поле name.

- [ ] **Step 3: Commit**

```bash
git -C re.cipe add app.js
git -C re.cipe commit -m "feat: app.js form logic (add/clear/validation)"
```

---

## Task 6: app.js — render списку і деталей

**Files:**
- Modify: `re.cipe/app.js` — дописати нижче

- [ ] **Step 1: Дописати в app.js — renderList і renderDetail**

Додати після `handleClear`:

```javascript
// ── List ─────────────────────────────────────────────────────────

function renderList(selectIdx) {
  var list = document.getElementById('recipeList');
  var data = state.recipes;

  document.getElementById('recipesPanelLabel').textContent =
    're.cipe — recipes (' + data.length + ')';
  document.getElementById('recipesStatus').textContent =
    data.length + ' recipe' + (data.length !== 1 ? 's' : '');

  list.innerHTML = '';

  if (data.length === 0) {
    state.selectedIdx = -1;
    renderDetail(-1);
    return;
  }

  data.forEach(function (r, i) {
    var item = document.createElement('div');
    item.className = 'r-item' + (i === selectIdx ? ' active' : '');
    item.innerHTML =
      '<div class="r-item-top">' +
        '<span class="r-prompt">&gt;</span>' +
        '<span class="r-name">' + escapeHtml(r.name) + '</span>' +
      '</div>' +
      '<div class="r-time">' + (r.time ? r.time + ' хв' : '—') + '</div>';

    item.addEventListener('click', function () {
      state.selectedIdx = i;
      document.querySelectorAll('.r-item').forEach(function (el) {
        el.classList.remove('active');
      });
      item.classList.add('active');
      renderDetail(i);
    });

    list.appendChild(item);
  });

  if (selectIdx >= 0 && selectIdx < data.length) {
    state.selectedIdx = selectIdx;
  }
}

// ── Detail ────────────────────────────────────────────────────────

function renderDetail(idx) {
  var detail = document.getElementById('recipeDetail');
  var data   = state.recipes;

  if (idx < 0 || idx >= data.length) {
    detail.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-text">// no recipes yet</div>' +
        '<div class="empty-sub">add one using the form</div>' +
      '</div>';
    return;
  }

  var r = data[idx];

  detail.style.opacity   = '0';
  detail.style.transform = 'translateY(4px)';
  detail.style.transition = 'none';

  detail.innerHTML =
    '<div class="detail-head">' +
      '<div class="detail-name">' + escapeHtml(r.name) + '</div>' +
      '<div class="detail-meta">// ' + (r.time ? r.time + ' хв' : '—') + '</div>' +
    '</div>' +
    '<div class="detail-block">' +
      '<div class="f-label">ingredients</div>' +
      '<div class="detail-val">' + escapeHtml(r.ingredients || '—') + '</div>' +
    '</div>' +
    '<div class="detail-block">' +
      '<div class="f-label">steps</div>' +
      '<div class="detail-val">' +
        escapeHtml(r.steps || '—').replace(/\n/g, '<br>') +
      '</div>' +
    '</div>' +
    '<div class="detail-foot">' +
      '<button class="btn-edit" id="btnEdit">edit</button>' +
      '<button class="btn-del"  id="btnDel">delete</button>' +
    '</div>';

  requestAnimationFrame(function () {
    detail.style.transition = 'opacity 0.16s, transform 0.16s';
    detail.style.opacity    = '1';
    detail.style.transform  = 'translateY(0)';
  });

  document.getElementById('btnEdit').addEventListener('click', function () {
    handleEdit(idx);
  });
  document.getElementById('btnDel').addEventListener('click', function () {
    handleDelete(idx);
  });
}
```

- [ ] **Step 2: Перевірити у браузері**

Додати 2-3 рецепти. Клікати між ними у списку — деталі повинні оновлюватися з fade-анімацією. Рецепт з кількома рядками у steps повинен відображатися з переносами рядків у деталях.

- [ ] **Step 3: Commit**

```bash
git -C re.cipe add app.js
git -C re.cipe commit -m "feat: app.js renderList and renderDetail"
```

---

## Task 7: app.js — edit, delete і init

**Files:**
- Modify: `re.cipe/app.js` — дописати нижче

- [ ] **Step 1: Дописати в app.js — handleEdit, handleDelete і init**

Додати після `renderDetail`:

```javascript
// ── Edit / Delete ─────────────────────────────────────────────────

function handleEdit(idx) {
  var r = state.recipes[idx];
  setFormValues(r);
  state.editIdx = idx;
  setFormMode('edit');
  document.getElementById('fName').focus();
}

function handleDelete(idx) {
  var data = loadRecipes();
  data.splice(idx, 1);
  saveRecipes(data);
  state.recipes = data;
  var nextIdx = data.length > 0 ? Math.min(idx, data.length - 1) : -1;
  renderList(nextIdx);
  renderDetail(nextIdx);
  if (state.editIdx === idx) {
    clearForm();
  }
}

// ── Init ──────────────────────────────────────────────────────────

(function init() {
  state.recipes = loadRecipes();
  initTheme();
  initAuth();
  initForm();
  var initIdx = state.recipes.length > 0 ? 0 : -1;
  renderList(initIdx);
  renderDetail(initIdx);
}());
```

- [ ] **Step 2: Перевірити edit у браузері**

Натиснути `edit` на рецепті — форма заповнюється, панель показує `edit_recipe`, кнопка змінюється на `update_recipe`. Змінити назву і зберегти — список оновлюється, деталі показують нову назву.

- [ ] **Step 3: Перевірити delete у браузері**

Натиснути `delete` на рецепті — він зникає зі списку. Якщо залишились інші — автоматично обирається сусідній. Якщо список порожній — empty state.

- [ ] **Step 4: Перевірити delete під час edit**

Відкрити рецепт для редагування (форма заповнена). Натиснути `delete` на тому ж рецепті — форма очищується і скидається у режим `new_recipe`.

- [ ] **Step 5: Перевірити збереження тем**

Змінити тему на `amber`. Перезавантажити сторінку — тема повинна залишитися amber (без flash). Перевірити всі 5 тем.

- [ ] **Step 6: Final commit**

```bash
git -C re.cipe add app.js
git -C re.cipe commit -m "feat: app.js edit, delete, init — app redesign complete"
```

---

## Spec Coverage Check

| Вимога з spec | Task |
|---|---|
| Hybrid aesthetic (JetBrains Mono, 8px radius, no glow) | Task 3 |
| Dot-grid background | Task 3 |
| Navbar з theme swatches | Task 2, 4 |
| Ліва панель — форма з 4 полями | Task 2, 5 |
| Panel bar з macOS dots | Task 2, 3 |
| Focused field → accent border | Task 3, 5 |
| Blinking cursor (нативний caret-color) | Task 3 |
| Кнопки save / clear | Task 2, 5 |
| Права панель — master-detail | Task 2, 6 |
| Список рецептів з `>` prompt | Task 6 |
| Деталі з fade анімацією | Task 6 |
| Edit завантажує у форму | Task 7 |
| Delete видаляє і оновлює список | Task 7 |
| Empty state | Task 6, 7 |
| Theme logic (localStorage + no-flash) | Task 2, 4 |
| localStorage формат сумісний | Task 4, 5 |
| commands.js видалено | Task 1 |
