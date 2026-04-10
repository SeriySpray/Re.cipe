# RE.cipe — Commands Guide

Як додавати нові команди в термінал.

---

## Як це працює

Коли користувач вводить рядок що починається з `/` — він трактується як команда.

```
> /help          ← команда
> Carbonara      ← звичайний текст (просто додається у вивід)
```

Всі команди реєструються в `commands.js` через `Commands.register()`.  
`app.js` викликає `Commands.run(ctx)` і передає контекст панелі.

---

## Додати нову команду

Відкрий `commands.js` і знайди секцію з коментарем:

```
// ДОДАВАЙ НОВІ КОМАНДИ НИЖЧЕ
```

Зареєструй команду за допомогою:

```js
Commands.register('назва', 'опис для /help', function (ctx) {
  // твоя логіка тут
});
```

---

## Об'єкт `ctx`

| Поле | Тип | Що містить |
|------|-----|-----------|
| `ctx.name` | string | ім'я команди (без `/`) |
| `ctx.args` | string[] | аргументи після команди |
| `ctx.raw` | string | повний рядок вводу |
| `ctx.panel` | Panel | поточна панель |
| `ctx.app` | App | головний об'єкт застосунку |
| `ctx.print(text, cls)` | function | виводить рядок у панель |

### CSS-класи для `ctx.print`

| Клас | Колір | Коли використовувати |
|------|-------|----------------------|
| `'t-cmd'` | accent (зелений) | успіх, результат |
| `'t-dim'` | сірий | коментарі, підказки |
| `'t-text'` | білий | звичайний вивід |
| `''` або `undefined` | білий | те саме що t-text |

---

## Приклади

### Проста команда без аргументів

```js
Commands.register('ping', 'check if terminal is alive', function (ctx) {
  ctx.print('pong!', 't-cmd');
});
```

Використання: `/ping`

---

### Команда з аргументом

```js
Commands.register('echo', 'repeat text back', function (ctx) {
  if (ctx.args.length === 0) {
    ctx.print('usage: /echo <text>', 't-dim');
    return;
  }
  ctx.print(ctx.args.join(' '), 't-text');
});
```

Використання: `/echo hello world`

---

### Команда що читає/пише localStorage

```js
Commands.register('save', 'save current panel content', function (ctx) {
  var lines = ctx.panel.outputEl.querySelectorAll('.t-text');
  var content = Array.from(lines).map(function (el) {
    return el.textContent;
  }).join('\n');

  localStorage.setItem('recipe-draft', content);
  ctx.print('✓ saved ' + lines.length + ' lines', 't-cmd');
});
```

Використання: `/save`

---

### Команда що звертається до всіх панелей

```js
Commands.register('broadcast', 'print to all panels', function (ctx) {
  var msg = ctx.args.join(' ') || '// broadcast';
  ctx.app.panels.forEach(function (panel) {
    ctx.app._print(panel, msg, 't-cmd');
  });
});
```

Використання: `/broadcast hello all`

---

## Правила іменування

- Тільки латиниця, цифри, підкреслення: `add_recipe`, `list`, `export2`
- Без пробілів у назві — пробіли розділяють аргументи
- Короткий опис для `/help` — одне речення, без крапки в кінці

---

## Структура файлів

```
re.cipe/
├── commands.js        ← реєстр команд (редагуй тут)
├── app.js             ← dispatch логіка (не чіпай)
└── docs/
    └── COMMANDS_GUIDE.md
```

Ніколи не додавай команди напряму в `app.js` — тільки через `Commands.register()` в `commands.js`.
