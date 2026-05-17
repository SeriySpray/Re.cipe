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

    if (!res || !res.ok) { setFormStatus('ERR — save failed'); return; }

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
  switchToFormTab();
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

// ── Mobile Tabs ───────────────────────────────────────────────────

function initTabs() {
  var ws = document.querySelector('.workspace');
  if (!ws) return;

  // Default mode for mobile
  ws.classList.add('show-form');

  document.querySelectorAll('.w-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.dataset.target;
      document.querySelectorAll('.w-tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      if (target === 'formPanel') {
        ws.classList.remove('show-recipes');
        ws.classList.add('show-form');
      } else {
        ws.classList.remove('show-form');
        ws.classList.add('show-recipes');
      }
    });
  });
}

function switchToFormTab() {
  var ws = document.querySelector('.workspace');
  if (!ws || window.innerWidth > 700) return;

  ws.classList.remove('show-recipes');
  ws.classList.add('show-form');

  document.querySelectorAll('.w-tab').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.target === 'formPanel');
  });
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
  initTabs();
  await reloadRecipes();
}());
