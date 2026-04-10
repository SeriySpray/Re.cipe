// ─── Panel ─────────────────────────────────────────────────────
function Panel(id) {
  this.id       = id;
  this.el       = null;
  this.outputEl = null;
  this.inputEl  = null;
  this.history  = [];
  this.histIdx  = -1;
}

Panel.prototype.build = function () {
  var username = localStorage.getItem('recipe-user') || 'guest';

  var pane = document.createElement('div');
  pane.className = 'pane';
  pane.dataset.paneId = this.id;

  var terminal = document.createElement('div');
  terminal.className = 'terminal';

  var bar = document.createElement('div');
  bar.className = 'term-bar';

  bar.innerHTML =
    '<span class="dot red"></span>' +
    '<span class="dot yellow"></span>' +
    '<span class="dot green"></span>';

  var titleLabel = document.createElement('span');
  titleLabel.className = 'term-title term-title-editable';
  titleLabel.innerHTML = 're.cipe \u2014 panel/' + this.id + '<span class="term-cursor"></span>';
  titleLabel.title = 'double-click to rename';

  var titleInput = document.createElement('input');
  titleInput.className = 'term-title-input';
  titleInput.style.display = 'none';

  function startEdit() {
    var current = titleLabel.firstChild.textContent;
    titleInput.value = current;
    titleLabel.style.display = 'none';
    titleInput.style.display = '';
    titleInput.focus();
    titleInput.select();
  }

  function commitEdit() {
    var val = titleInput.value.trim();
    if (val) {
      titleLabel.firstChild.textContent = val;
    }
    titleInput.style.display = 'none';
    titleLabel.style.display = '';
  }

  titleLabel.addEventListener('dblclick', startEdit);

  titleInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.stopPropagation(); commitEdit(); }
    if (e.key === 'Escape') { e.stopPropagation(); titleInput.style.display = 'none'; titleLabel.style.display = ''; }
  });
  titleInput.addEventListener('blur', commitEdit);

  bar.appendChild(titleLabel);
  bar.appendChild(titleInput);

  var output = document.createElement('div');
  output.className = 'pane-output';

  var emptyState = document.createElement('div');
  emptyState.className = 'pane-empty';
  emptyState.innerHTML =
    '<p class="pane-empty-text">' +
    '// empty panel<br>' +
    'start writing...' +
    '</p>';
  output.appendChild(emptyState);

  var inputRow = document.createElement('div');
  inputRow.className = 'pane-input-row';

  var prompt = document.createElement('span');
  prompt.className = 'pane-prompt';
  prompt.textContent = '>';

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'pane-input';
  input.placeholder = 'write here...';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');

  var inputWrap = document.createElement('div');
  inputWrap.className = 'pane-input-wrap';
  inputWrap.appendChild(input);

  var suggestions = document.createElement('div');
  suggestions.className = 'pane-suggestions';
  suggestions.style.display = 'none';
  inputRow.appendChild(suggestions);

  inputRow.appendChild(prompt);
  inputRow.appendChild(inputWrap);

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

  this.el          = pane;
  this.outputEl    = output;
  this.inputEl     = input;
  this.suggestEl   = suggestions;

  return pane;
};

// ─── App ───────────────────────────────────────────────────────
var App = {
  panels:    [],
  activeIdx: 0,

  init: function () {
    var username = localStorage.getItem('recipe-user') || 'guest';
    document.getElementById('topbarUsername').textContent = username;

    document.getElementById('btnLogout').addEventListener('click', function () {
      window.location.href = 'auth.html';
    });

    this.createPanel();

    document.addEventListener('keydown', this._onKeyDown.bind(this));
  },

  createPanel: function () {
    var id    = this.panels.length + 1;
    var panel = new Panel(id);
    var el    = panel.build();

    this.panels.push(panel);
    document.getElementById('workspace').appendChild(el);

    var self = this;
    var idx  = this.panels.length - 1;

    el.addEventListener('click', function () {
      self.focusPanel(idx);
    });

    // ── Suggestions logic ──────────────────────────────────────
    var suggestIdx = -1;

    function getSuggestions(val) {
      if (!val || val.charAt(0) !== '/') return [];
      var q    = val.slice(1).toLowerCase();
      var cmds = Commands.all();
      return Object.keys(cmds)
        .filter(function (k) { return k.indexOf(q) === 0 && k !== q; })
        .map(function (k) { return { name: k, desc: cmds[k].description, match: q }; });
    }

    function renderSuggestions(items) {
      var el = panel.suggestEl;
      el.innerHTML = '';
      suggestIdx = -1;
      if (items.length === 0) { el.style.display = 'none'; return; }
      items.forEach(function (item, i) {
        var row = document.createElement('div');
        row.className = 'pane-suggestion-item';
        row.dataset.idx = i;
        row.innerHTML =
          '<span class="suggestion-name">/' + item.name + '</span>' +
          '<span class="suggestion-desc">' + item.desc + '</span>';
        row.addEventListener('mousedown', function (e) {
          e.preventDefault();
          panel.inputEl.value = '/' + item.name + ' ';
          el.style.display = 'none';
          panel.inputEl.focus();
        });
        el.appendChild(row);
      });
      el.style.display = '';
    }

    function moveSuggest(dir) {
      var items = panel.suggestEl.querySelectorAll('.pane-suggestion-item');
      if (!items.length) return;
      items[suggestIdx < 0 ? 0 : suggestIdx].classList.remove('focused');
      suggestIdx = (suggestIdx + dir + items.length) % items.length;
      items[suggestIdx].classList.add('focused');
    }

    function acceptSuggest() {
      var focused = panel.suggestEl.querySelector('.focused');
      if (!focused) return false;
      var name = focused.querySelector('.suggestion-name').textContent;
      panel.inputEl.value = name + ' ';
      panel.suggestEl.style.display = 'none';
      suggestIdx = -1;
      return true;
    }

    panel.inputEl.addEventListener('input', function () {
      if (panel._interactive) return;
      renderSuggestions(getSuggestions(panel.inputEl.value));
    });

    panel._mainKeydown = function (e) {
      var suggestOpen = panel.suggestEl.style.display !== 'none';

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (suggestOpen) { moveSuggest(-1); return; }
        if (panel.histIdx < panel.history.length - 1) {
          panel.histIdx++;
          panel.inputEl.value = panel.history[panel.histIdx];
          renderSuggestions([]);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (suggestOpen) { moveSuggest(1); return; }
        if (panel.histIdx > 0) {
          panel.histIdx--;
          panel.inputEl.value = panel.history[panel.histIdx];
        } else {
          panel.histIdx = -1;
          panel.inputEl.value = '';
        }
        renderSuggestions([]);
        return;
      }

      if (e.key === 'Escape' && suggestOpen) {
        e.stopPropagation();
        panel.suggestEl.style.display = 'none';
        suggestIdx = -1;
        return;
      }

      if (e.key !== 'Enter') return;
      if (suggestOpen && acceptSuggest()) { e.preventDefault(); return; }
      var val = panel.inputEl.value;
      if (!val) return;

      var empty = panel.outputEl.querySelector('.pane-empty');
      if (empty) empty.remove();

      panel.history.unshift(val);
      panel.histIdx = -1;
      panel.inputEl.value = '';
      panel.suggestEl.style.display = 'none';
      suggestIdx = -1;

      // Команда: рядок починається з /
      if (val.charAt(0) === '/') {
        var parts = val.slice(1).trim().split(/\s+/);
        var name  = parts[0].toLowerCase();
        var args  = parts.slice(1);
        App._print(panel, val, 't-dim');
        Commands.run({
          name:  name,
          args:  args,
          raw:   val,
          panel: panel,
          app:   App,
          print: function (text, cls) { App._print(panel, text, cls); }
        });
        return;
      }

      // Звичайний текст
      App._print(panel, '> ' + val, 't-text');
    };

    panel.inputEl.addEventListener('keydown', panel._mainKeydown);

    this.focusPanel(idx);
    return panel;
  },

  focusPanel: function (idx) {
    this.activeIdx = idx;
    this.panels.forEach(function (p, i) {
      p.el.classList.toggle('active', i === idx);
    });
    this.panels[idx].inputEl.focus();
  },

  splitPanel: function () {
    if (this.panels.length >= 2) return;
    this.createPanel();
  },

  _print: function (panel, text, cls) {
    var div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    panel.outputEl.appendChild(div);
    panel.outputEl.scrollTop = panel.outputEl.scrollHeight;
  },

  _onKeyDown: function (e) {
    if (e.key === 'Escape') {
      if (this.panels.length < 2) return;
      var closed = this.panels.splice(this.activeIdx, 1)[0];
      closed.el.remove();
      this.activeIdx = 0;
      this.focusPanel(0);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (this.panels.length < 2) {
        this.createPanel();
      } else {
        this.focusPanel((this.activeIdx + 1) % this.panels.length);
      }
      return;
    }
  }
};

App.init();
