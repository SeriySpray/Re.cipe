# RE.cipe — App Dashboard Design

**Date:** 2026-04-11  
**Status:** Approved  
**Scope:** `app.html` — головна сторінка після реєстрації/логіну

---

## Overview

Після успішної авторизації користувач потрапляє на `app.html` — термінальний застосунок у стилі тайлінг менеджера. Сторінка повністю відповідає дизайн-системі лендінгу (JetBrains Mono, CSS-токени, термінальна естетика).

---

## Структура сторінки

```
┌─────────────────────────────────────┐
│  [RE.cipe]  chef_42  [amber] logout │  ← .app-topbar (52px, фіксований)
├─────────────────────────────────────┤
│                                     │
│   ┌──────────────┐ ┌─────────────┐  │  ← .workspace (решта висоти)
│   │ term-bar     │ │ term-bar    │  │
│   │              │ │             │  │
│   │  [активна]   │ │ [неактивна] │  │
│   │              │ │             │  │
│   │ > _          │ │             │  │
│   │ term-status  │ │ term-status │  │
│   └──────────────┘ └─────────────┘  │
│                                     │
│       [W] split  [Tab] focus        │  ← .keyhints
└─────────────────────────────────────┘
```

**Компоненти:**
- `.app-topbar` — фіксований рядок: лого `[RE.cipe]`, ім'я користувача, поточна тема, кнопка `logout`
- `.workspace` — `flex-row`, займає `calc(100dvh - topbar - keyhints)`
- `.pane` — одна панель (`flex: 1`), містить `.terminal` на повну висоту
- `.keyhints` — дрібний рядок підказок клавіш знизу

---

## Архітектура JS (`app.js`)

### Об'єкт `App`

```js
App = {
  panels: [],       // масив Panel-об'єктів
  activeIdx: 0,     // індекс активної панелі

  init()            // створює першу панель, вішає глобальний keydown
  createPanel()     // будує DOM-панель, додає до panels[] і .workspace
  focusPanel(idx)   // знімає data-active з усіх, ставить на idx
  splitPanel()      // додає другу панель (лише якщо панелей < 2)
  handleCommand(panel, input)  // парсить і виконує команду
}
```

### Об'єкт `Panel`

```js
Panel = {
  el,           // кореневий DOM-елемент (.pane)
  inputEl,      // <input> в якому друкують
  outputEl,     // .term-body де виводяться результати
  history: [],  // масив попередніх команд
  histIdx: -1   // поточна позиція в history при навігації ↑↓
}
```

---

## Клавіші

| Клавіша | Умова | Дія |
|---------|-------|-----|
| `W` | фокус НЕ в `<input>` | `App.splitPanel()` |
| `Tab` | будь-де | `App.focusPanel(next)`, `preventDefault` |
| `↑` | фокус в `<input>` | навігація по `history[]` вгору |
| `↓` | фокус в `<input>` | навігація по `history[]` вниз |

---

## Термінальний інтерфейс панелі

```
┌─ term-bar ──────────────────────────────┐
│ ● ● ●   re.cipe — panel/1       [act]  │
├─────────────────────────────────────────┤
│ (term-body — скролиться)                │
│                                         │
│ > add_recipe()                          │
│ // enter recipe details                 │
│ > name: Carbonara                       │
│ > ingredients: eggs, bacon, pasta       │
│ ✓ recipe saved                          │
│                                         │
│ > _                                     │
├─────────────────────────────────────────┤
│ ● READY   panel/1   chef_42      v0.1  │
└─────────────────────────────────────────┘
```

- **Активна панель:** `border-color: var(--accent)`, `[act]` в term-bar
- **Неактивна панель:** `border-color: var(--border)`
- Клік по неактивній панелі також фокусує її

---

## Базові команди

| Команда | Дія |
|---------|-----|
| `help` | виводить список доступних команд |
| `add_recipe` | запускає покроковий input: name → ingredients → steps → time |
| `list` | виводить збережені рецепти з localStorage |
| `clear` | очищає term-body поточної панелі |

Рецепти зберігаються у `localStorage` під ключем `recipe-data` (масив об'єктів).

---

## CSS-зміни (`styles.css`)

Дописуємо в кінець файлу, нічого не змінюємо:

```css
.app-page        /* body клас, flex-column, height: 100dvh, overflow: hidden */
.app-topbar      /* фіксований рядок зверху */
.workspace       /* flex-row, flex:1, overflow: hidden */
.pane            /* flex:1, display:flex, flex-direction:column */
.pane.active     /* border-color: var(--accent) на внутрішньому .terminal */
.pane .terminal  /* height: 100%, display:flex, flex-direction:column */
.pane .term-body /* flex:1, overflow-y:auto */
.pane-input-row  /* рядок з '>' і <input> внизу term-body */
.keyhints        /* padding:6px 16px, font-size:11px, color:var(--muted) */
```

---

## Редірект після авторизації

В `auth.html`, після `submit` форм логіну і реєстрації:

```js
form.addEventListener('submit', function(e) {
  e.preventDefault();
  // ... валідація ...
  window.location.href = 'app.html';
});
```

---

## Файлова структура

```
re.cipe/
├── index.html    (лендінг — без змін)
├── auth.html     (авторизація — додаємо редірект на app.html)
├── app.html      (новий — головний застосунок)
├── app.js        (новий — логіка App + Panel)
├── styles.css    (доповнюємо новими класами в кінці)
└── main.js       (без змін)
```

---

## Обмеження / поза скоупом

- Бекенд відсутній — дані у `localStorage`
- Максимум 2 панелі (відповідно до скетчу)
- Мобільна адаптація панелей — поза скоупом цієї ітерації
