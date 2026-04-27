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

  if (state.editIdx === idx) {
    clearForm();
  }

  var nextIdx = data.length > 0 ? Math.min(idx, data.length - 1) : -1;
  renderList(nextIdx);
  renderDetail(nextIdx);
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
