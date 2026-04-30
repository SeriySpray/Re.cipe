# Frontend–API Connection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the vanilla JS frontend on GitHub Pages to the local Node.js/PostgreSQL backend by replacing localStorage recipe storage with real API calls and adding JWT-based authentication.

**Architecture:** A shared `api.js` provides a single `apiFetch()` helper that automatically attaches the JWT token to every request and handles 401 redirects. `auth.js` handles login/register form submissions. `app.js` is updated to load/save/delete recipes via the API instead of localStorage.

**Tech Stack:** Vanilla JS, fetch API, localStorage (token + theme only), `http://localhost:3000` backend

---

## File Map

| File | Action | What changes |
|---|---|---|
| `api.js` | Create | Base URL + `apiFetch()` helper |
| `auth.js` | Create | Login and register form handlers |
| `auth.html` | Modify (lines 202–212) | Remove inline submit handler; add script tags |
| `app.js` | Rewrite | Replace localStorage ops with API calls; add auth guard |
| `app.html` | Modify (line 115) | Add `<script src="api.js">` before `app.js` |

---

## Task 1: Create `api.js`

**Files:**
- Create: `api.js`

- [ ] **Step 1: Create `api.js`**

```js
var API = 'http://localhost:3000';

async function apiFetch(path, options) {
  options = options || {};
  var token = localStorage.getItem('recipe-token');
  var headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (options.headers) Object.assign(headers, options.headers);

  var res;
  try {
    res = await fetch(API + path, Object.assign({}, options, { headers: headers }));
  } catch (e) {
    throw new Error('server_unavailable');
  }

  if (res.status === 401) {
    localStorage.removeItem('recipe-token');
    localStorage.removeItem('recipe-user');
    window.location.href = 'auth.html';
    return null;
  }

  return res;
}
```

- [ ] **Step 2: Commit**

```bash
git add api.js
git commit -m "feat: add apiFetch helper with JWT auth and 401 redirect"
```

---

## Task 2: Create `auth.js`

**Files:**
- Create: `auth.js`

- [ ] **Step 1: Create `auth.js`**

```js
// Already logged in → skip auth page
if (localStorage.getItem('recipe-token')) {
  window.location.href = 'app.html';
}

function setAuthStatus(panel, msg) {
  var el = document.querySelector('.auth-status-' + panel);
  if (el) el.textContent = msg;
}

// ── Login ─────────────────────────────────────────────────────────

var loginForm = document.querySelector('.login-panel .auth-form');

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  var email    = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;

  if (!email || !password) {
    setAuthStatus('login', 'ERR — email and password required');
    return;
  }

  setAuthStatus('login', 'CONNECTING...');

  try {
    var res  = await fetch(API + '/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email, password: password })
    });
    var data = await res.json();

    if (!res.ok) {
      setAuthStatus('login', 'ERR — ' + (data.error || 'login failed'));
      return;
    }

    localStorage.setItem('recipe-token', data.token);
    localStorage.setItem('recipe-user',  data.user.display_name || data.user.email);
    window.location.href = 'app.html';
  } catch (e) {
    setAuthStatus('login', 'ERR — server unavailable');
  }
});

// ── Register ──────────────────────────────────────────────────────

var registerForm = document.querySelector('.register-panel .auth-form');

registerForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  var username = document.getElementById('reg-username').value.trim();
  var email    = document.getElementById('reg-email').value.trim();
  var password = document.getElementById('reg-password').value;
  var confirm  = document.getElementById('reg-confirm').value;

  if (!email || !password) {
    setAuthStatus('register', 'ERR — email and password required');
    return;
  }

  if (password !== confirm) {
    setAuthStatus('register', 'ERR — passwords do not match');
    return;
  }

  setAuthStatus('register', 'CONNECTING...');

  try {
    var res  = await fetch(API + '/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email, password: password, display_name: username })
    });
    var data = await res.json();

    if (!res.ok) {
      setAuthStatus('register', 'ERR — ' + (data.error || 'registration failed'));
      return;
    }

    localStorage.setItem('recipe-token', data.token);
    localStorage.setItem('recipe-user',  data.user.display_name || data.user.email);
    window.location.href = 'app.html';
  } catch (e) {
    setAuthStatus('register', 'ERR — server unavailable');
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add auth.js
git commit -m "feat: add auth.js with login and register API calls"
```

---

## Task 3: Modify `auth.html`

**Files:**
- Modify: `auth.html` lines 190–213

The current inline `<script>` block (lines 190–213) contains a fake submit handler that redirects to `app.html` without calling the API. Replace it with two external script tags.

- [ ] **Step 1: Replace the inline script block in `auth.html`**

Find this block at the bottom of `auth.html` (just before `</body>`):

```html
  <script>
    // Switch to register tab when #register hash is present
    function applyHash() {
      if (window.location.hash === '#register') {
        document.getElementById('tab-register').checked = true;
      } else {
        document.getElementById('tab-login').checked = true;
      }
    }
    applyHash();
    window.addEventListener('hashchange', applyHash);

    // Redirect to app after form submit (login and register)
    document.querySelectorAll('.auth-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var usernameInput = form.querySelector('input[name="username"]');
        if (usernameInput && usernameInput.value.trim()) {
          localStorage.setItem('recipe-user', usernameInput.value.trim());
        }
        window.location.href = 'app.html';
      });
    });
  </script>
```

Replace it with:

```html
  <script>
    function applyHash() {
      if (window.location.hash === '#register') {
        document.getElementById('tab-register').checked = true;
      } else {
        document.getElementById('tab-login').checked = true;
      }
    }
    applyHash();
    window.addEventListener('hashchange', applyHash);
  </script>
  <script src="api.js"></script>
  <script src="auth.js"></script>
```

- [ ] **Step 2: Commit**

```bash
git add auth.html
git commit -m "feat: replace fake auth redirect with real API calls in auth.html"
```

---

## Task 4: Rewrite `app.js`

**Files:**
- Modify: `app.js`

Replace the entire file. Key changes from the old version:
- Remove `loadRecipes()` / `saveRecipes()` (localStorage)
- Add `toLocalFormat()` / `toApiFormat()` to map between API and display shapes
- `init()` is now `async`, adds auth guard, calls `reloadRecipes()`
- `handleSave()` and `handleDelete()` are now `async`, call the API
- `initAuth()` logout now clears `recipe-token`

- [ ] **Step 1: Replace `app.js` with the following**

```js
// api.js must be loaded before this file (see app.html)

// ── Format helpers ────────────────────────────────────────────────
// Converts the API recipe shape to the shape used by renderList/renderDetail

function toLocalFormat(r) {
  return {
    id:          r.id,
    name:        r.title,
    ingredients: (r.ingredients || []).map(function (i) { return i.name; }).join('\n'),
    steps:       r.description || '',
    time:        r.cook_time ? String(r.cook_time) : ''
  };
}

// Converts the form values shape to the API request body shape
function toApiFormat(local) {
  return {
    title:       local.name,
    description: local.steps  || null,
    cook_time:   local.time   ? parseInt(local.time, 10) : null,
    ingredients: local.ingredients
      ? local.ingredients.split('\n')
          .map(function (s) { return s.trim(); })
          .filter(Boolean)
          .map(function (s) { return { name: s }; })
      : []
  };
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
    localStorage.removeItem('recipe-token');
    localStorage.removeItem('recipe-user');
    window.location.href = 'auth.html';
  });
}

// ── Helpers ───────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setFormStatus(text) {
  var el = document.getElementById('formStatus');
  if (el) el.textContent = text;
}

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
  setFormStatus(isEdit ? 'EDITING' : 'READY');
}

async function handleSave() {
  var vals = getFormValues();
  if (!vals.name) { document.getElementById('fName').focus(); return; }

  setFormStatus('SAVING...');

  try {
    var res;
    if (state.editIdx >= 0) {
      var id = state.recipes[state.editIdx].id;
      res = await apiFetch('/api/recipes/' + id, {
        method: 'PUT',
        body:   JSON.stringify(toApiFormat(vals))
      });
    } else {
      res = await apiFetch('/api/recipes', {
        method: 'POST',
        body:   JSON.stringify(toApiFormat(vals))
      });
    }

    if (!res || !res.ok) {
      setFormStatus('ERR — save failed');
      return;
    }

    clearForm();
    await reloadRecipes();
  } catch (e) {
    setFormStatus('ERR — server unavailable');
  }
}

function handleClear() {
  clearForm();
}

// ── API ───────────────────────────────────────────────────────────

async function reloadRecipes() {
  setFormStatus('LOADING...');
  try {
    var res = await apiFetch('/api/recipes');
    if (!res || !res.ok) { setFormStatus('ERR — load failed'); return; }
    var data = await res.json();
    state.recipes = data.map(toLocalFormat);
    var initIdx = state.recipes.length > 0 ? 0 : -1;
    renderList(initIdx);
    renderDetail(initIdx);
    setFormStatus('READY');
  } catch (e) {
    setFormStatus('ERR — server unavailable');
  }
}

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

  detail.style.transition = 'none';
  detail.style.opacity    = '0';
  detail.style.transform  = 'translateY(4px)';

  detail.innerHTML =
    '<div class="detail-head">' +
      '<div class="detail-name">' + escapeHtml(r.name) + '</div>' +
      '<div class="detail-meta">// ' + (r.time ? r.time + ' хв' : '—') + '</div>' +
    '</div>' +
    '<div class="detail-block">' +
      '<div class="f-label">ingredients</div>' +
      '<div class="detail-val">' + escapeHtml(r.ingredients || '—').replace(/\n/g, '<br>') + '</div>' +
    '</div>' +
    '<div class="detail-block">' +
      '<div class="f-label">steps</div>' +
      '<div class="detail-val">' + escapeHtml(r.steps || '—').replace(/\n/g, '<br>') + '</div>' +
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

// ── Edit / Delete ─────────────────────────────────────────────────

function handleEdit(idx) {
  var r = state.recipes[idx];
  setFormValues(r);
  state.editIdx = idx;
  setFormMode('edit');
  document.getElementById('fName').focus();
}

async function handleDelete(idx) {
  var id = state.recipes[idx].id;
  setFormStatus('DELETING...');

  try {
    var res = await apiFetch('/api/recipes/' + id, { method: 'DELETE' });
    if (!res || !res.ok) { setFormStatus('ERR — delete failed'); return; }
    if (state.editIdx === idx) clearForm();
    await reloadRecipes();
  } catch (e) {
    setFormStatus('ERR — server unavailable');
  }
}

// ── Init ──────────────────────────────────────────────────────────

(async function init() {
  if (!localStorage.getItem('recipe-token')) {
    window.location.href = 'auth.html';
    return;
  }

  initTheme();
  initAuth();
  initForm();
  await reloadRecipes();
}());
```

- [ ] **Step 2: Commit**

```bash
git add app.js
git commit -m "feat: replace localStorage recipe storage with API calls in app.js"
```

---

## Task 5: Modify `app.html`

**Files:**
- Modify: `app.html` line 115

- [ ] **Step 1: Add `api.js` script tag before `app.js` in `app.html`**

Find line 115 in `app.html`:
```html
  <script src="app.js"></script>
```

Replace with:
```html
  <script src="api.js"></script>
  <script src="app.js"></script>
```

- [ ] **Step 2: Commit**

```bash
git add app.html
git commit -m "feat: load api.js before app.js in app.html"
```

---

## Task 6: Manual end-to-end test

With `node server.js` running:

- [ ] **Step 1: Test register**

Open `auth.html` in browser. Fill in the register form:
- username: `testuser`
- email: `test@test.com`
- password: `secret123`
- confirm: `secret123`

Expected: redirected to `app.html`, navbar shows `// testuser`, recipe list is empty.

- [ ] **Step 2: Test create recipe**

In the form:
- name: `Carbonara`
- ingredients: `pasta\neggs\nbacon` (one per line)
- steps: `Boil pasta. Fry bacon. Mix eggs.`
- cook_time_min: `25`

Click `save_recipe`.

Expected: recipe appears in the list, detail panel shows the recipe.

- [ ] **Step 3: Test edit**

Click `edit` on the recipe, change the name to `Pasta Carbonara`, click `update_recipe`.

Expected: list and detail panel update with the new name.

- [ ] **Step 4: Test delete**

Click `delete` on the recipe. Expected: recipe disappears, empty state shows.

- [ ] **Step 5: Test logout and auth guard**

Click `> logout`. Expected: redirected to `auth.html`.
Navigate directly to `app.html` in the URL bar. Expected: immediately redirected to `auth.html`.

- [ ] **Step 6: Test login**

Log in with `test@test.com` / `secret123`. Expected: redirected to `app.html`, recipe list loads from database.

- [ ] **Step 7: Commit test confirmation**

```bash
git add -A
git commit -m "feat: connect frontend to backend API — auth and recipe CRUD working"
```
