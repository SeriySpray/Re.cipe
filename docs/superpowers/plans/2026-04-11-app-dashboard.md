# App Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Створити головну сторінку `app.html` — термінальний застосунок з панельною архітектурою, сплітингом по `W` і перемиканням по `Tab`.

**Architecture:** Об'єкт `App` керує масивом `Panel`-об'єктів. Кожна панель будує власний DOM і має незалежний стан (буфер команд, history). CSS-токени та класи з існуючого `styles.css` перевикористовуються максимально, нові класи дописуються в кінець файлу.

**Tech Stack:** Vanilla HTML5, CSS3 (CSS custom properties), Vanilla JS (ES5-compatible, без модулів), JetBrains Mono, localStorage.

---

## File Map

| Дія | Файл | Відповідальність |
|-----|------|-----------------|
| Create | `app.html` | HTML-каркас: topbar, workspace, keyhints |
| Create | `app.js` | App + Panel логіка, команди, клавіші |
| Modify | `styles.css` | Нові класи в кінці файлу |
| Modify | `auth.html` | Редірект на `app.html` після submit |

---

## Task 1: CSS — layout класи для app-сторінки

**Files:**
- Modify: `styles.css` (дописати в кінець)

- [ ] **Step 1: Дописати нові класи в кінець `styles.css`**

```css
/* ── App Page ── */
.app-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

.app-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  height: 52px;
  background: rgba(13,13,13,0.96);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.app-topbar .logo { font-size: 14px; font-weight: 700; color: var(--accent); }

.topbar-user {
  font-size: 11px;
  color: var(--dim);
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar-theme {
  font-size: 11px;
  color: var(--muted);
  padding: 3px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.topbar-logout {
  font-size: 11px;
  color: var(--dim);
  cursor: pointer;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: color 0.15s, border-color 0.15s;
  font-family: var(--font);
}
.topbar-logout:hover { color: var(--accent); border-color: var(--accent); }

.workspace {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
  gap: 0;
}

.pane {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  border-right: 1px solid var(--border);
}
.pane:last-child { border-right: none; }

.pane .terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  border-bottom: none;
  transition: border-color 0.15s;
}

.pane.active .terminal {
  outline: 1px solid var(--accent);
  outline-offset: -1px;
}

.pane .term-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.pane-output {
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px 4px;
  font-size: 12px;
  line-height: 1.9;
}

.pane-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px 12px;
  border-top: 1px solid var(--border);
}

.pane-prompt {
  color: var(--accent);
  font-size: 12px;
  user-select: none;
}

.pane-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font);
  font-size: 12px;
  color: var(--text);
  caret-color: var(--accent);
}
.pane-input::placeholder { color: var(--muted); }

.keyhints {
  padding: 5px 24px;
  font-size: 10px;
  color: var(--muted);
  border-top: 1px solid var(--border);
  display: flex;
  gap: 24px;
  flex-shrink: 0;
  background: var(--bg);
}

.keyhint-key {
  color: var(--dim);
  border: 1px solid var(--border);
  border-radius: 2px;
  padding: 0 4px;
  margin-right: 4px;
  font-size: 10px;
}
```

- [ ] **Step 2: Відкрити `index.html` в браузері, перевірити що нічого не зламалось**

Відкрити `re.cipe/index.html` у браузері. Лендінг має виглядати точно так само — нові класи не мають впливу на існуючі сторінки.

- [ ] **Step 3: Commit**

```bash
cd re.cipe
git add styles.css
git commit -m "style: add app-page layout classes (topbar, workspace, pane, keyhints)"
```

---

## Task 2: `app.html` — HTML-каркас

**Files:**
- Create: `app.html`

- [ ] **Step 1: Створити `app.html`**

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
</head>
<body class="app-page">
  <script>
    (function () {
      var s = localStorage.getItem('recipe-theme');
      if (s && s !== 'green') document.body.setAttribute('data-theme', s);
    })();
  </script>

  <!-- TOPBAR -->
  <header class="app-topbar">
    <span class="logo">[RE.cipe]</span>
    <div class="topbar-user">
      <span id="topbarUsername" class="t-dim">// guest</span>
      <span id="topbarTheme" class="topbar-theme">green</span>
      <button class="topbar-logout" id="btnLogout">&gt; logout</button>
    </div>
  </header>

  <!-- WORKSPACE: panels injected here by app.js -->
  <div class="workspace" id="workspace"></div>

  <!-- KEY HINTS -->
  <div class="keyhints">
    <span><span class="keyhint-key">W</span> split</span>
    <span><span class="keyhint-key">Tab</span> focus next</span>
    <span><span class="keyhint-key">↑↓</span> history</span>
    <span><span class="keyhint-key">help</span> commands</span>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Відкрити `app.html` в браузері**

Має бути видно: чорний topbar з `[RE.cipe]` і кнопкою `logout`, порожній workspace, рядок підказок знизу. Консоль браузера покаже помилку `app.js not found` — це очікувано.

- [ ] **Step 3: Commit**

```bash
git add app.html
git commit -m "feat: add app.html scaffold (topbar, workspace, keyhints)"
```

---

## Task 3: `app.js` — Panel: будування DOM

**Files:**
- Create: `app.js`

- [ ] **Step 1: Створити `app.js` з конструктором Panel**

```js
// ─── Panel ─────────────────────────────────────────────────────
function Panel(id) {
  this.id      = id;
  this.history = [];
  this.histIdx = -1;
  this.el      = null;
  this.outputEl = null;
  this.inputEl  = null;
}

Panel.prototype.build = function () {
  var theme = localStorage.getItem('recipe-theme') || 'green';
  var username = localStorage.getItem('recipe-user') || 'guest';

  // .pane
  var pane = document.createElement('div');
  pane.className = 'pane';
  pane.dataset.paneId = this.id;

  // .terminal
  var terminal = document.createElement('div');
  terminal.className = 'terminal';

  // term-bar
  var bar = document.createElement('div');
  bar.className = 'term-bar';
  bar.innerHTML =
    '<span class="dot red"></span>' +
    '<span class="dot yellow"></span>' +
    '<span class="dot green"></span>' +
    '<span class="term-title">re.cipe \u2014 panel/' + this.id + '<span class="term-cursor"></span></span>';

  // output area
  var output = document.createElement('div');
  output.className = 'pane-output';

  // input row
  var inputRow = document.createElement('div');
  inputRow.className = 'pane-input-row';

  var prompt = document.createElement('span');
  prompt.className = 'pane-prompt';
  prompt.textContent = '>';

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'pane-input';
  input.placeholder = 'type a command or recipe...';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');

  inputRow.appendChild(prompt);
  inputRow.appendChild(input);

  // term-status
  var status = document.createElement('div');
  status.className = 'term-status';
  status.innerHTML =
    '<span class="status-dot"></span>' +
    '<span>READY</span>' +
    '<span style="margin-left:auto">panel/' + this.id + ' &nbsp; ' + username + ' &nbsp; v0.1</span>';

  terminal.appendChild(bar);
  terminal.appendChild(output);
  terminal.appendChild(inputRow);
  terminal.appendChild(status);
  pane.appendChild(terminal);

  this.el       = pane;
  this.outputEl = output;
  this.inputEl  = input;

  return pane;
};
```

- [ ] **Step 2: Відкрити `app.html`, перевірити консоль**

Консоль не повинна показувати синтаксичних помилок. `Panel` існує як глобальна функція.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add Panel constructor and build() method"
```

---

## Task 4: `app.js` — App.init() і App.createPanel()

**Files:**
- Modify: `app.js` (дописати після Panel)

- [ ] **Step 1: Дописати об'єкт App і викликати init()**

```js
// ─── App ───────────────────────────────────────────────────────
var App = {
  panels:    [],
  activeIdx: 0,

  init: function () {
    // Показуємо username в topbar
    var username = localStorage.getItem('recipe-user') || 'guest';
    var theme    = localStorage.getItem('recipe-theme') || 'green';
    document.getElementById('topbarUsername').textContent = '// ' + username;
    document.getElementById('topbarTheme').textContent   = theme;

    // Logout
    document.getElementById('btnLogout').addEventListener('click', function () {
      window.location.href = 'auth.html';
    });

    // Перша панель
    this.createPanel();

    // Глобальні клавіші
    document.addEventListener('keydown', this._onKeyDown.bind(this));
  },

  createPanel: function () {
    var id    = this.panels.length + 1;
    var panel = new Panel(id);
    var el    = panel.build();

    this.panels.push(panel);
    document.getElementById('workspace').appendChild(el);

    // Клік на панель — фокус
    var self = this;
    var idx  = this.panels.length - 1;
    el.addEventListener('click', function () {
      self.focusPanel(idx);
    });

    // Enter — виконати команду
    panel.inputEl.addEventListener('keydown', function (e) {
      self._onInputKey(e, panel);
    });

    this.focusPanel(idx);
    return panel;
  }
};

// Запуск
App.init();
```

- [ ] **Step 2: Відкрити `app.html` в браузері**

Має з'явитись одна термінальна панель на весь workspace. В topbar — `// guest` і `green`. Консоль чиста.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add App.init() and App.createPanel()"
```

---

## Task 5: `app.js` — focusPanel() і Tab

**Files:**
- Modify: `app.js` (додати методи до App)

- [ ] **Step 1: Додати focusPanel і _onKeyDown до App**

Вставити ці методи всередину об'єкта `App` (після `createPanel`, перед закриваючою `}`):

```js
  focusPanel: function (idx) {
    this.activeIdx = idx;
    this.panels.forEach(function (p, i) {
      if (i === idx) {
        p.el.classList.add('active');
      } else {
        p.el.classList.remove('active');
      }
    });
    this.panels[idx].inputEl.focus();
  },

  _onKeyDown: function (e) {
    // Tab — перемикання панелей
    if (e.key === 'Tab') {
      e.preventDefault();
      var next = (this.activeIdx + 1) % this.panels.length;
      this.focusPanel(next);
      return;
    }

    // W — split (тільки якщо інпут не активний)
    if (e.key === 'w' || e.key === 'W') {
      if (document.activeElement === this.panels[this.activeIdx].inputEl) return;
      this.splitPanel();
      return;
    }
  },

  _onInputKey: function (e, panel) {
    if (e.key === 'Enter') {
      var val = panel.inputEl.value.trim();
      if (!val) return;
      panel.history.unshift(val);
      panel.histIdx = -1;
      panel.inputEl.value = '';
      this.handleCommand(panel, val);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (panel.histIdx < panel.history.length - 1) {
        panel.histIdx++;
        panel.inputEl.value = panel.history[panel.histIdx];
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (panel.histIdx > 0) {
        panel.histIdx--;
        panel.inputEl.value = panel.history[panel.histIdx];
      } else {
        panel.histIdx = -1;
        panel.inputEl.value = '';
      }
    }
  },

  splitPanel: function () {
    if (this.panels.length >= 2) return;
    this.createPanel();
  },
```

- [ ] **Step 2: Перевірити в браузері**

1. Натиснути `Tab` — нічого не відбувається (одна панель, фокус залишається).
2. Клікнути на порожню область поза інпутом, натиснути `W` — з'являється друга панель.
3. Натиснути `Tab` — фокус переходить між панелями (акцент-бордер переключається).
4. Натиснути `W` ще раз — нічого не відбувається (вже 2 панелі).

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add focusPanel, Tab switching, W split, input history"
```

---

## Task 6: `app.js` — handleCommand() і базові команди

**Files:**
- Modify: `app.js` (додати методи до App)

- [ ] **Step 1: Додати допоміжні методи виводу і handleCommand**

Вставити всередину об'єкта `App`:

```js
  _print: function (panel, text, cls) {
    var div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    panel.outputEl.appendChild(div);
    panel.outputEl.scrollTop = panel.outputEl.scrollHeight;
  },

  handleCommand: function (panel, raw) {
    var self  = this;
    var parts = raw.trim().split(/\s+/);
    var cmd   = parts[0].toLowerCase();

    // Echo the command
    this._print(panel, '> ' + raw, 't-dim');

    if (cmd === 'clear') {
      panel.outputEl.innerHTML = '';
      return;
    }

    if (cmd === 'help') {
      var lines = [
        '// available commands:',
        '  help          — show this list',
        '  clear         — clear terminal output',
        '  add_recipe    — add a new recipe (interactive)',
        '  list          — list saved recipes',
      ];
      lines.forEach(function (l) {
        self._print(panel, l, l.startsWith('//') ? 't-dim' : 't-text');
      });
      return;
    }

    if (cmd === 'list') {
      var data = JSON.parse(localStorage.getItem('recipe-data') || '[]');
      if (data.length === 0) {
        this._print(panel, '// no recipes yet. try: add_recipe', 't-dim');
      } else {
        this._print(panel, '// ' + data.length + ' recipe(s):', 't-dim');
        data.forEach(function (r, i) {
          self._print(panel, '  [' + (i + 1) + '] ' + r.name + '  [' + r.time + 'min]', 't-cmd');
        });
      }
      return;
    }

    if (cmd === 'add_recipe') {
      this._startAddRecipe(panel);
      return;
    }

    this._print(panel, 'unknown command: ' + cmd + '. type "help" for list.', 't-dim');
  },

  _startAddRecipe: function (panel) {
    var self   = this;
    var recipe = { name: '', ingredients: '', steps: '', time: '' };
    var fields = [
      { key: 'name',        label: 'name',         placeholder: 'Carbonara' },
      { key: 'ingredients', label: 'ingredients',  placeholder: 'eggs, bacon, pasta' },
      { key: 'steps',       label: 'steps',        placeholder: 'boil pasta, fry bacon...' },
      { key: 'time',        label: 'cook_time_min', placeholder: '25' },
    ];
    var step = 0;

    this._print(panel, '// add_recipe — fill in each field, press Enter', 't-dim');

    function askNext() {
      if (step >= fields.length) {
        // Save
        var data = JSON.parse(localStorage.getItem('recipe-data') || '[]');
        data.push(recipe);
        localStorage.setItem('recipe-data', JSON.stringify(data));
        self._print(panel, '\u2713 recipe "' + recipe.name + '" saved!', 't-cmd');
        panel.inputEl.placeholder = 'type a command or recipe...';
        panel.inputEl.onkeydown = null;
        panel.inputEl.addEventListener('keydown', function (e) {
          self._onInputKey(e, panel);
        });
        return;
      }
      var f = fields[step];
      panel.inputEl.placeholder = f.label + ': ' + f.placeholder;
      self._print(panel, '> ' + f.label + ':', 't-acc');

      panel.inputEl.onkeydown = function (e) {
        if (e.key === 'Enter') {
          var val = panel.inputEl.value.trim();
          if (!val) return;
          recipe[f.key] = val;
          self._print(panel, '  ' + val, 't-text');
          panel.inputEl.value = '';
          step++;
          askNext();
        }
      };
    }

    askNext();
  },
```

- [ ] **Step 2: Перевірити в браузері**

1. Ввести `help` → список команд.
2. Ввести `list` → `// no recipes yet`.
3. Ввести `add_recipe` → покроковий input: name, ingredients, steps, cook_time_min.
4. Після заповнення → `✓ recipe "..." saved!`.
5. Ввести `list` → показує збережений рецепт.
6. Ввести `clear` → термінал очищується.
7. Стрілка `↑` → показує попередню команду.
8. Невідома команда → підказка.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add command handling (help, clear, list, add_recipe)"
```

---

## Task 7: `auth.html` — редірект на `app.html` після submit

**Files:**
- Modify: `auth.html`

- [ ] **Step 1: Знайти `<script>` внизу `auth.html` і замінити його**

Поточний блок (рядки ~191-201):
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
  </script>
```

Замінити на:
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
        // Save username from register form if available
        var usernameInput = form.querySelector('input[name="username"]');
        if (usernameInput && usernameInput.value.trim()) {
          localStorage.setItem('recipe-user', usernameInput.value.trim());
        }
        window.location.href = 'app.html';
      });
    });
  </script>
```

- [ ] **Step 2: Перевірити редірект**

1. Відкрити `auth.html`.
2. Ввести будь-які дані у форму логіну, натиснути `> login --now`.
3. Має відбутись перехід на `app.html`.
4. В topbar — `// guest` (або username якщо реєстрація).
5. Відкрити register, ввести username `chef_42`, заповнити решту, submit.
6. На `app.html` topbar показує `// chef_42`.

- [ ] **Step 3: Commit**

```bash
git add auth.html
git commit -m "feat: redirect to app.html after login/register submit"
```

---

## Task 8: Фінальна перевірка і polish

**Files:**
- Modify: `app.html` (дрібні виправлення якщо потрібно)

- [ ] **Step 1: Наскрізна перевірка flow**

1. `index.html` → клік `> sign_up` → `auth.html#register`
2. Заповнити форму, submit → `app.html`
3. Topbar: правильне ім'я і тема
4. Термінал: `help`, `add_recipe`, `list`, `clear` працюють
5. `W` (поза інпутом) → дві панелі з'являються
6. `Tab` → перемикає фокус між панелями (акцент-бордер)
7. Клік на неактивну панель → фокус переходить
8. `↑/↓` в інпуті → навігація по history
9. `logout` → повернення на `auth.html`
10. Тема зберігається між сторінками (перевірити на amber)

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: complete app dashboard with split terminal and command handling"
```
