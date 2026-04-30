# RE.cipe — Frontend–API Connection Design Spec

> Date: 2026-04-30

---

## Overview

Connect the existing vanilla JS frontend (GitHub Pages) to the local Node.js/PostgreSQL backend. Replace all localStorage recipe storage with API calls. Add real authentication via JWT.

---

## Files

| File | Action | Responsibility |
|---|---|---|
| `api.js` | Create | Base URL config + `apiFetch()` helper with auto JWT header + 401 redirect |
| `auth.js` | Create | Login and register form submission handlers |
| `app.js` | Modify | Replace localStorage recipe ops with API calls; add auth guard on load |
| `auth.html` | Modify | Add `<script src="api.js">` and `<script src="auth.js">` |
| `app.html` | Modify | Add `<script src="api.js">` before `app.js` |

---

## `api.js`

```js
const API = 'http://localhost:3000';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('recipe-token');
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      ...(options.headers || {})
    }
  });
  if (res.status === 401) {
    localStorage.removeItem('recipe-token');
    window.location.href = 'auth.html';
  }
  return res;
}
```

---

## `auth.js`

- On page load: if `recipe-token` exists in localStorage → redirect to `app.html`
- Intercept login form submit → `POST /api/auth/login`
- Intercept register form submit → `POST /api/auth/register`
- On success: save `recipe-token` and `recipe-user` (display_name) to localStorage → redirect to `app.html`
- On error: display error message in the form's `.auth-status` bar in TUI style

---

## `app.js` Changes

- **Auth guard:** on init, if no `recipe-token` → `window.location.href = 'auth.html'`
- **`loadRecipes()`:** replace with `GET /api/recipes` via `apiFetch`
- **`handleSave()`:** new recipe → `POST /api/recipes`; edit → `PUT /api/recipes/:id`
- **`handleDelete()`:** `DELETE /api/recipes/:id` via `apiFetch`
- **`initAuth()`:** reads `recipe-user` from localStorage (saved at login) — no change needed
- **Logout:** clear `recipe-token` and `recipe-user` from localStorage → redirect to `auth.html`
- **Remove:** `saveRecipes()` helper (no longer needed), `loadRecipes()` localStorage version
- **Recipe state:** store `id` from API on each recipe object so PUT/DELETE know which ID to use

---

## localStorage Keys

| Key | Value | Set by |
|---|---|---|
| `recipe-token` | JWT string | auth.js on login/register |
| `recipe-user` | display_name string | auth.js on login/register |
| `recipe-theme` | theme name | existing theme switcher (unchanged) |

---

## Error Handling

- Network error (server offline): catch fetch error → show "server unavailable" in status bar
- 401 Unauthorized: `apiFetch` auto-redirects to `auth.html`
- 4xx/5xx from API: show `error` field from JSON response in status bar
