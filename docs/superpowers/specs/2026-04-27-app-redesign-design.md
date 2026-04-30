# RE.cipe — App Page Redesign

**Date**: 2026-04-27  
**Scope**: `app.html`, `app.js`, `styles.css` — повна заміна. `commands.js` — видалення.

---

## Мета

Замінити термінально-командну парадигму (`/add_recipe`, `/list`) на split-panel layout з формою зліва та master-detail переглядом рецептів справа. Зберегти ДНК проекту (JetBrains Mono, термінальний chrome, акцентні кольори).

---

## Естетика

- **Шрифт**: JetBrains Mono (400, 700) — без змін
- **Радіуси**: 8px (замість 4px — трохи м'якше)
- **Glow/shadows**: відсутні — тільки border-color при фокусі
- **Фон**: dot-grid overlay (`radial-gradient`, 22px, ~3% opacity)
- **Акцент**: CSS-змінна `--accent`, 5 тем (green/amber/cyan/rose/violet) — незмінно
- **Status dot**: пульсуюча анімація (без box-shadow)

---

## Layout

```
┌─ navbar (48px, fixed) ─────────────────────────────┐
│ [RE.cipe] / // user      ● ● ● ● ●   > logout      │
└────────────────────────────────────────────────────┘
┌─ workspace (100vh - 48px, padding 10px) ───────────┐
│  ┌─ LEFT (400px) ──────┐  ┌─ RIGHT (flex:1) ──────┐│
│  │ panel-bar            │  │ panel-bar              ││
│  │ ─────────────────── │  │ ────────────────────── ││
│  │ form-scroll          │  │  ┌─list(180px)─┐ detail││
│  │   // comment         │  │  │ > Борщ      │ head  ││
│  │   [name field]       │  │  │   Піца      │ block ││
│  │   [ingredients]      │  │  │   Салат     │ block ││
│  │   [steps]            │  │  └─────────────┘ foot  ││
│  │   [cook_time]        │  │                        ││
│  │ ─────────────────── │  │ ────────────────────── ││
│  │ [save] [clear]       │  │ panel-status           ││
│  │ panel-status         │  └────────────────────────┘│
│  └─────────────────────┘                             │
└────────────────────────────────────────────────────┘
```

---

## Компоненти

### Navbar
- Логотип `[RE.cipe]`, роздільник `/`, ім'я юзера `// username`
- 5 кольорових крапок-swatches для теми (клік → `data-theme` на `body` + `localStorage`)
- Кнопка `> logout` → редірект на `auth.html`

### Ліва панель — форма
- **Panel bar**: macOS-dots + лейбл `re.cipe — new_recipe`
- **Коментар**: `// fill in fields and press save` (колір `--dim`)
- **4 поля**: `name`, `ingredients` (tall), `steps` (tall), `cook_time_min`
  - Структура: label (8px uppercase) + `<input>` або `<textarea>`
  - Стан: звичайний (`border: --border2`), фокус (`border: --accent`)
  - Blinking cursor — нативний браузерний (без кастомного span)
- **Кнопки**: `[save_recipe]` (accent fill) + `[clear]` (ghost)
- **Panel status**: `● READY` зліва, `v0.2` справа

### Права панель — master-detail
- **Panel bar**: macOS-dots + лейбл `re.cipe — recipes (N)`
- **Список** (180px, border-right):
  - Кожен рецепт: `> name` + час під ним
  - Активний: `background: accent 7%`, `border: accent 18%`, prompt і назва — accent колір
  - Клік → оновити деталь + fade анімація
- **Деталь** (flex: 1):
  - Заголовок + `// N хв`
  - Блок `ingredients`
  - Блок `steps`
  - Кнопка `[edit]`: завантажує дані рецепту у ліву форму, кнопка save стає "update", після збереження — оновлює запис у localStorage і перемальовує список
  - Кнопка `[delete]`: видаляє рецепт з localStorage, прибирає зі списку, скидає деталь на empty state
  - **Empty state** деталі (текст `// select a recipe`) — показується при старті якщо список порожній, або після delete
- **Panel status**: `● N recipes` + `username · v0.2`

---

## Дані

- **Сховище**: `localStorage`, ключ `recipe-data`
- **Формат**: `JSON array` — `[{ name, ingredients, steps, time }]`
- **Сумісність**: той самий формат що і у старому `/add_recipe` — існуючі дані не ламаються

---

## Теми

- Логіка залишається: inline `<script>` у `<head>` читає `localStorage('recipe-theme')` і ставить `data-theme` до першого рендеру
- Зміна теми: клік на swatch → `body.setAttribute('data-theme', name)` + `localStorage.setItem('recipe-theme', name)`
- CSS-змінні `[data-theme="..."]` залишаються без змін у `styles.css`

---

## Файлові зміни

| Файл | Дія |
|---|---|
| `app.html` | Повна заміна — новий markup |
| `app.js` | Повна заміна — нова логіка форми + master-detail |
| `commands.js` | **Видалити** |
| `styles.css` | Додати `.workspace`, `.panel`, `.form-*`, `.r-*`, `.detail-*` секції; прибрати `.pane-*`, `.keyhints`, `.pane-suggestions` |

---

## Що НЕ змінюється

- `index.html` — landing page не чіпаємо
- `auth.html` — авторизація не чіпаємо
- CSS-змінні та теми у `styles.css` — залишаються
- Navbar базові стилі (`.navbar`, `.logo`, `.btn`) — залишаються
