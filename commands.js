// ─── Command Registry ──────────────────────────────────────────
//
// Щоб додати нову команду — викликай Commands.register() внизу.
// Синтаксис: /command arg1 arg2
//
// handler(ctx) отримує:
//   ctx.panel   — поточна панель (Panel object)
//   ctx.app     — App object (для доступу до всіх панелей)
//   ctx.args    — масив рядків після імені команди
//   ctx.print   — функція виводу: ctx.print(text, cssClass)
//   ctx.raw     — повний рядок вводу
//
// ───────────────────────────────────────────────────────────────

var Commands = (function () {

  var registry = {};

  function register(name, description, handler) {
    registry[name.toLowerCase()] = {
      name:        name,
      description: description,
      handler:     handler
    };
  }

  function run(ctx) {
    var cmd = registry[ctx.name];
    if (!cmd) {
      ctx.print('unknown command: /' + ctx.name + '  (type /help for list)', 't-dim');
      return;
    }
    cmd.handler(ctx);
  }

  function all() {
    return registry;
  }

  // ── Built-in: help ─────────────────────────────────────────
  register('help', 'show available commands', function (ctx) {
    var cmds = all();
    ctx.print('// available commands:', 't-dim');
    Object.keys(cmds).sort().forEach(function (key) {
      ctx.print('  /' + key + ' \u2014 ' + cmds[key].description, 't-text');
    });
  });

  // ── Built-in: clear ────────────────────────────────────────
  register('clear', 'clear terminal output', function (ctx) {
    ctx.panel.outputEl.innerHTML = '';
  });

  // ── Built-in: theme ────────────────────────────────────────
  register('theme', 'change colour theme: /theme <green|amber|cyan|rose|violet>', function (ctx) {
    var valid = ['green', 'amber', 'cyan', 'rose', 'violet'];
    var name  = (ctx.args[0] || '').toLowerCase();

    if (!name) {
      var current = localStorage.getItem('recipe-theme') || 'green';
      ctx.print('// current theme: ' + current, 't-dim');
      ctx.print('// available: ' + valid.join(', '), 't-dim');
      return;
    }

    if (valid.indexOf(name) === -1) {
      ctx.print('unknown theme: ' + name + '. available: ' + valid.join(', '), 't-dim');
      return;
    }

    if (name === 'green') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', name);
    }
    localStorage.setItem('recipe-theme', name);
    ctx.print('\u2713 theme changed to ' + name, 't-cmd');
  });

  // ── Built-in: add_recipe ───────────────────────────────────
  register('add_recipe', 'add a new recipe (interactive)', function (ctx) {
    var panel  = ctx.panel;
    var input  = panel.inputEl;
    var recipe = { name: '', ingredients: '', steps: '', time: '' };
    var fields = [
      { key: 'name',        label: 'name',          placeholder: 'Carbonara' },
      { key: 'ingredients', label: 'ingredients',   placeholder: 'eggs, bacon, pasta' },
      { key: 'steps',       label: 'steps',         placeholder: 'boil pasta, fry bacon...' },
      { key: 'time',        label: 'cook_time_min', placeholder: '25' },
    ];
    var step = 0;

    ctx.print('// add_recipe \u2014 fill each field and press Enter', 't-dim');
    ctx.print('// press Escape to cancel', 't-dim');

    // Вимикаємо suggestions і основний keydown на час інтерактивного вводу
    panel._interactive = true;
    panel.suggestEl.style.display = 'none';
    input.removeEventListener('keydown', panel._mainKeydown);

    function restore() {
      panel._interactive = false;
      input.placeholder = 'write here...';
      input.onkeydown = null;
      input.addEventListener('keydown', panel._mainKeydown);
    }

    function askNext() {
      if (step >= fields.length) {
        var data = JSON.parse(localStorage.getItem('recipe-data') || '[]');
        data.push(recipe);
        localStorage.setItem('recipe-data', JSON.stringify(data));
        ctx.print('\u2713 recipe "' + recipe.name + '" saved!', 't-cmd');
        restore();
        return;
      }
      var f = fields[step];
      input.placeholder = f.label + ': e.g. ' + f.placeholder;
      ctx.print('> ' + f.label + ':', 't-acc');

      input.onkeydown = function (e) {
        if (e.key === 'Escape') {
          e.stopPropagation();
          input.value = '';
          ctx.print('// add_recipe cancelled', 't-dim');
          restore();
          return;
        }
        if (e.key !== 'Enter') return;
        var val = input.value.trim();
        if (!val) return;
        recipe[f.key] = val;
        ctx.print('  ' + val, 't-text');
        input.value = '';
        step++;
        askNext();
      };
    }

    askNext();
  });

  // ── Built-in: list ─────────────────────────────────────────
  register('list', 'list all saved recipes', function (ctx) {
    var data = JSON.parse(localStorage.getItem('recipe-data') || '[]');

    if (data.length === 0) {
      ctx.print('// no recipes yet. use /add_recipe to add one.', 't-dim');
      return;
    }

    ctx.print('// ' + data.length + ' recipe(s):', 't-dim');
    data.forEach(function (r, i) {
      ctx.print('  [' + (i + 1) + '] ' + r.name + '  [' + r.time + 'min]', 't-cmd');
    });
    ctx.print('// type a number to view recipe, Escape to exit', 't-dim');

    var panel = ctx.panel;
    var input = panel.inputEl;

    panel._interactive = true;
    panel.suggestEl.style.display = 'none';
    input.removeEventListener('keydown', panel._mainKeydown);
    input.placeholder = 'select recipe number...';

    input.onkeydown = function (e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        restore();
        return;
      }
      if (e.key !== 'Enter') return;

      var val = input.value.trim();
      input.value = '';

      if (!val) { restore(); return; }

      var idx = parseInt(val, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= data.length) {
        ctx.print('// invalid number: ' + val, 't-dim');
        return;
      }

      var r = data[idx];
      ctx.print('', '');
      ctx.print('[' + (idx + 1) + '] ' + r.name, 't-cmd');
      ctx.print('    ingredients : ' + r.ingredients, 't-text');
      ctx.print('    steps       : ' + r.steps, 't-text');
      ctx.print('    time        : ' + r.time + ' min', 't-text');
      ctx.print('', '');
      ctx.print('// type another number or Escape to exit', 't-dim');
    };

    function restore() {
      panel._interactive = false;
      input.placeholder = 'write here...';
      input.onkeydown = null;
      input.addEventListener('keydown', panel._mainKeydown);
    }
  });

  // ── Built-in: delete ──────────────────────────────────────────
  register('delete', 'delete a recipe: /delete [number]', function (ctx) {
    var data = JSON.parse(localStorage.getItem('recipe-data') || '[]');

    if (data.length === 0) {
      ctx.print('// no recipes to delete.', 't-dim');
      return;
    }

    var panel = ctx.panel;
    var input = panel.inputEl;
    var preselected = parseInt(ctx.args[0], 10);

    function restore() {
      panel._interactive = false;
      input.placeholder = 'write here...';
      input.onkeydown = null;
      input.addEventListener('keydown', panel._mainKeydown);
    }

    function askConfirm(idx) {
      var r = data[idx];
      ctx.print('// delete "' + r.name + '"? [y/n]', 't-dim');
      input.placeholder = 'y / n';

      input.onkeydown = function (e) {
        if (e.key === 'Escape') { e.stopPropagation(); ctx.print('// cancelled', 't-dim'); restore(); return; }
        if (e.key !== 'Enter') return;
        var val = input.value.trim().toLowerCase();
        input.value = '';
        if (val === 'y' || val === 'yes') {
          data.splice(idx, 1);
          localStorage.setItem('recipe-data', JSON.stringify(data));
          ctx.print('[ OK ] "' + r.name + '" deleted.', 't-cmd');
        } else {
          ctx.print('// cancelled', 't-dim');
        }
        restore();
      };
    }

    function askNumber() {
      ctx.print('// ' + data.length + ' recipe(s):', 't-dim');
      data.forEach(function (r, i) {
        ctx.print('  [' + (i + 1) + '] ' + r.name + '  [' + r.time + 'min]', 't-text');
      });
      ctx.print('// enter number to delete, Escape to cancel', 't-dim');

      panel._interactive = true;
      panel.suggestEl.style.display = 'none';
      input.removeEventListener('keydown', panel._mainKeydown);
      input.placeholder = 'recipe number...';

      input.onkeydown = function (e) {
        if (e.key === 'Escape') { e.stopPropagation(); ctx.print('// cancelled', 't-dim'); restore(); return; }
        if (e.key !== 'Enter') return;
        var val = input.value.trim();
        input.value = '';
        var idx = parseInt(val, 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= data.length) {
          ctx.print('// invalid number: ' + val, 't-dim');
          return;
        }
        askConfirm(idx);
      };
    }

    panel._interactive = true;
    panel.suggestEl.style.display = 'none';
    input.removeEventListener('keydown', panel._mainKeydown);

    if (!isNaN(preselected) && preselected >= 1 && preselected <= data.length) {
      askConfirm(preselected - 1);
    } else {
      askNumber();
    }
  });

  // ─────────────────────────────────────────────────────────────
  // ДОДАВАЙ НОВІ КОМАНДИ НИЖЧЕ
  // Приклад:
  //
  // register('hello', 'greet the user', function (ctx) {
  //   var name = ctx.args[0] || 'world';
  //   ctx.print('Hello, ' + name + '!', 't-cmd');
  // });
  //
  // ─────────────────────────────────────────────────────────────

  return { register: register, run: run, all: all };

})();
