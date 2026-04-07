# 📖 RE.cipe — JavaScript пояснення для початківців

> Цей файл детально пояснює **кожен рядок JavaScript**, що реалізований у `index.html`.  
> Пояснення охоплює не лише _що_ робить код, а й _чому_ він написаний саме так і що означає кожен символ.

---

## 🗂️ Зміст

1. [Де живе JavaScript у HTML?](#1-де-живе-javascript-у-html)
2. [Що таке змінна?](#2-що-таке-змінна)
3. [Що таке функція?](#3-що-таке-функція)
4. [Функція 1 — Theme Switcher (зміна теми)](#4-функція-1--theme-switcher-зміна-теми)
5. [Функція 2 — Анімація друкування тексту](#5-функція-2--анімація-друкування-тексту)
6. [Функція 3 — Scroll-reveal (поява при скролі)](#6-функція-3--scroll-reveal-поява-при-скролі)
7. [Функція 4 — Анімований термінал demo](#7-функція-4--анімований-термінал-demo)
8. [Функція 5 — Підсвічування активного посилання](#8-функція-5--підсвічування-активного-посилання)
9. [Словник термінів](#9-словник-термінів)

---

## 1. Де живе JavaScript у HTML?

JavaScript підключається всередині тегу `<script>`. У нашому проєкті він розташований **в кінці файлу** перед `</body>`:

```html
<body>
  <!-- весь HTML-контент -->

  <script>
    // ТУТ ЖИВЕ JAVASCRIPT
  </script>
</body>
```

### Чому в кінці, а не на початку?

Браузер читає HTML **зверху вниз**. Якщо поставити `<script>` у `<head>`, JavaScript спробує знайти елементи сторінки — але вони ще не завантажені! Розміщення в кінці `<body>` гарантує, що весь HTML вже існує в пам'яті браузера.

### Що таке `//` ?

```js
// Це коментар — браузер його ігнорує
```

Подвійний слеш `//` — це **однорядковий коментар**. Він пояснює код людині, але не впливає на роботу програми.

---

## 2. Що таке змінна?

Змінна — це **іменована "коробка"** для зберігання даних.

```js
var ім'я = значення;
const ім'я = значення;
let ім'я = значення;
```

| Ключове слово | Коли змінювати? | Де доступна? |
|---|---|---|
| `var` | можна | скрізь у функції |
| `let` | можна | лише в блоці `{}` |
| `const` | не можна | лише в блоці `{}` |

**Приклад із нашого коду:**

```js
const navbar = document.getElementById('navbar');
```

- `const` — ця змінна більше не зміниться (ми не будемо присвоювати їй інший елемент)
- `navbar` — ім'я змінної (ми самі його вигадали)
- `=` — оператор присвоєння (поклади значення праворуч у змінну ліворуч)
- `document` — спеціальний об'єкт, що представляє всю HTML-сторінку
- `.getElementById('navbar')` — метод, що шукає елемент з атрибутом `id="navbar"`

---

## 3. Що таке функція?

Функція — це **блок коду з ім'ям**, який можна запустити (викликати) у будь-який момент.

```js
// Оголошення функції (вона ще не запускається)
function привітання(ім'я) {
  console.log('Привіт, ' + ім'я + '!');
}

// Виклик функції (ось тепер вона запускається)
привітання('Олег'); // → "Привіт, Олег!"
```

Синтаксис:
- `function` — ключове слово, що каже "далі буде функція"
- `привітання` — ім'я (ми вигадуємо самі)
- `(ім'я)` — **параметри** (дані, які передаємо функції)
- `{ ... }` — **тіло функції** (що вона робить)

---

## 4. Функція 1 — Theme Switcher (зміна теми)

**Мета:** Коли користувач натискає на колір теми — акцентний колір змінюється **на всьому сайті** одночасно. Вибір зберігається навіть після перезавантаження сторінки.

### Як це працює разом із CSS?

У `styles.css` є CSS-змінна `--accent` яка задає основний колір скрізь:
```css
:root {
  --accent: #00ff88; /* зелений за замовчуванням */
}
[data-theme="amber"]  { --accent: #ffb300; }
[data-theme="cyan"]   { --accent: #00d4ff; }
[data-theme="rose"]   { --accent: #ff4d6d; }
[data-theme="violet"] { --accent: #a855f7; }
```

Коли JS ставить атрибут `data-theme="amber"` на `<body>` — браузер автоматично перемикає `--accent` на жовтий, і **всі елементи** що використовують `var(--accent)` змінюють колір миттєво.

### Код крок за кроком:

```js
var themeRadios = document.querySelectorAll('.theme-radio');
```
↑ Знаходимо всі 5 радіо-кнопок (green, amber, cyan, rose, violet) і зберігаємо їх список.

```js
themeRadios.forEach(function (radio) {
  radio.addEventListener('change', function () {
```
- `.forEach` — перебираємо кожну кнопку по черзі
- `'change'` — подія яка спрацьовує коли радіо-кнопка **перемикається** (стає вибраною)

```js
    var theme = radio.id.replace('t-', '');
```
- `radio.id` — атрибут `id` кнопки, наприклад `'t-amber'`
- `.replace('t-', '')` — видаляємо префікс `'t-'`, отримуємо `'amber'`
- Тепер у `theme` чиста назва: `'green'`, `'amber'`, `'cyan'` тощо

```js
    if (theme === 'green') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
```
- `document.body` — елемент `<body>` всієї сторінки
- `.setAttribute('data-theme', 'amber')` — ставить атрибут: `<body data-theme="amber">`
- `.removeAttribute('data-theme')` — видаляє атрибут (для green повертаємось до `:root` за замовчуванням)
- Саме цей атрибут на `<body>` активує потрібне CSS-правило і змінює колір скрізь

```js
    localStorage.setItem('recipe-theme', theme);
```
- `localStorage` — вбудоване сховище браузера: зберігає дані **між сесіями** (навіть після закриття вкладки)
- `.setItem('ключ', 'значення')` — записує пару ключ-значення
- Тепер якщо закрити і відкрити сторінку — тема запам'ятається

### Відновлення теми при завантаженні:

```js
(function () {
  var saved = localStorage.getItem('recipe-theme');
  if (saved && saved !== 'green') {
    document.body.setAttribute('data-theme', saved);
    var radio = document.getElementById('t-' + saved);
    if (radio) radio.checked = true;
  }
})();
```
- `(function () { ... })()` — **IIFE** (Immediately Invoked Function Expression): функція яка викликає сама себе одразу
- Це патерн для коду який потрібно виконати **один раз** при завантаженні, не забруднюючи глобальний простір імен
- `localStorage.getItem('recipe-theme')` — читаємо збережену тему
- `saved && saved !== 'green'` — якщо є збережена тема І вона не зелена (зелена — за замовчуванням)
- `radio.checked = true` — програмно позначаємо потрібну радіо-кнопку як вибрану

**Повний потік:**
```
Користувач клікає "amber"
  → подія 'change' спрацьовує
    → з id "t-amber" отримуємо "amber"
      → body отримує data-theme="amber"
        → CSS бачить [data-theme="amber"] і змінює --accent на #ffb300
          → весь сайт стає жовтим миттєво
            → localStorage зберігає "amber"

Наступного разу при завантаженні:
  → IIFE читає "amber" з localStorage
    → ставить data-theme="amber" на body
      → позначає кнопку amber як вибрану
```

---

## 5. Функція 2 — Анімація друкування тексту

**Мета:** Текст `// terminal-style recipe management` з'являється поступово, символ за символом — як нібито його хтось друкує в терміналі.

```js
function typeText(element, text, speed, onDone) {
```
- `element` — HTML-елемент, куди друкувати
- `text` — рядок, який друкувати
- `speed` — затримка між символами у мілісекундах (1000мс = 1 секунда)
- `onDone` — функція, яку запустити після завершення (так звана **callback-функція**)

```js
  var index = 0;
  element.textContent = '';
```
- `index` — лічильник: який символ зараз додаємо (починаємо з 0, бо рядки в JS нумеруються з нуля)
- `element.textContent = ''` — очищаємо елемент перед початком

```js
  var timer = setInterval(function () {
```
- `setInterval` — вбудована функція JS: **запускай функцію кожні N мілісекунд**
- Повертає `timer` — ідентифікатор таймера (щоб потім можна було зупинити)

```js
    element.textContent += text[index];
```
- `text[index]` — отримуємо символ рядка за позицією `index`
  - Наприклад: `'hello'[0]` → `'h'`, `'hello'[1]` → `'e'`
- `+=` — скорочення для `element.textContent = element.textContent + text[index]`
  - Тобто **дописуємо** новий символ до вже існуючого тексту

```js
    index++;
```
- `index++` — скорочення для `index = index + 1`
- Переходимо до наступного символу

```js
    if (index >= text.length) {
      clearInterval(timer);
      if (onDone) onDone();
    }
```
- `text.length` — кількість символів у рядку
- Коли `index` досягає кінця рядка — зупиняємо таймер через `clearInterval`
- `if (onDone) onDone()` — якщо передали callback-функцію, запускаємо її

**Виклик функції:**
```js
typeText(eyebrow, '// terminal-style recipe management', 35, function () {
  heroSub.style.opacity    = '1';
  heroCta.style.opacity    = '1';
});
```
- Після завершення друкування (через callback) — плавно показуємо підзаголовок і кнопку
- `element.style.opacity = '1'` — змінюємо CSS-стиль прямо з JavaScript

**Потік виконання:**
```
Сторінка відкрилась
  → typeText запускається
    → setInterval: кожні 35мс додає один символ
      → "/", потім "/", потім " ", потім "t"...
        → текст повністю надруковано → clearInterval зупиняє таймер
          → callback: показуємо підзаголовок і кнопку
```

---

## 6. Функція 3 — Scroll-reveal (поява при скролі)

**Мета:** Секції сторінки спочатку невидимі (`opacity: 0`) і зміщені вниз. Коли користувач доскролить до них — вони плавно з'являються.

**Як HTML підготовлено:**
```html
<section class="section" id="demo" data-reveal>
```
Атрибут `data-reveal` — це спеціальний маркер для JavaScript. Він не впливає на зовнішній вигляд сам по собі.

**CSS для початкового стану (невидимий):**
```css
[data-reveal] {
  opacity: 0;              /* повністю прозорий */
  transform: translateY(20px); /* зміщений на 20px вниз */
  transition: opacity 1.1s ease, transform 1.1s ease; /* плавна зміна (1.1 секунди) */
}
[data-reveal].revealed {
  opacity: 1;              /* повністю видимий */
  transform: translateY(0); /* на своєму місці */
}
```

**JavaScript — IntersectionObserver:**

```js
var revealElements = document.querySelectorAll('[data-reveal]');
```
↑ Знаходимо всі елементи з атрибутом `data-reveal`.

```js
var revealObserver = new IntersectionObserver(function (entries) {
```
- `IntersectionObserver` — вбудований браузерний інструмент: **"стеж за елементами і повідом, коли вони з'являться у viewport"**
- `viewport` — видима область екрану
- `entries` — масив (список) елементів, стан яких змінився

```js
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
```
- `entry.isIntersecting` — `true` якщо елемент зараз видимий на екрані

```js
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
```
- Додаємо клас `revealed` → CSS виконує плавну анімацію появи
- `.unobserve()` — перестаємо стежити (елемент вже з'явився — більше не потрібно)

```js
}, { threshold: 0.12 });
```
- `threshold: 0.12` — спрацьовує коли **12% елемента** видно на екрані

```js
revealElements.forEach(function (el) {
  revealObserver.observe(el);
});
```
↑ Починаємо стежити за кожним елементом з `data-reveal`.

---

## 7. Функція 4 — Анімований термінал demo

**Мета:** Рядки у терміналі з'являються один за одним з реалістичною затримкою — наче хтось насправді вводить команди і отримує відповіді.

**Дані — масив об'єктів:**

```js
var termLines = [
  { cls: 'cmd',  text: '$ re.cipe --open "My Recipes"' },
  { cls: 'dim',  text: '▼ /My Recipes/' },
  // ...
];
```
- `[ ]` — **масив** (список елементів)
- `{ }` — **об'єкт** (набір пар "ключ: значення")
- `cls: 'cmd'` — CSS-клас для кольору рядка (`t-cmd` → зелений)
- `text: '...'` — текст рядка

**Головна функція:**

```js
function runTermDemo() {
  if (demoStarted) return;
  demoStarted = true;
```
- `if (demoStarted) return;` — захист від подвійного запуску: якщо вже запущено — виходимо з функції
- `return` — негайно завершує виконання функції

```js
  var i = 0;

  function addLine() {
    if (i >= total) {
      termStatus.textContent = 'DONE';
      return;
    }
```
- `addLine` — внутрішня функція (функція всередині функції — це нормально в JS!)
- `i` — лічильник поточного рядка

```js
    var lineData = termLines[i];
    var div = document.createElement('div');
```
- `termLines[i]` — беремо об'єкт з масиву за індексом `i`
- `document.createElement('div')` — **створюємо новий HTML-елемент** `<div>` у пам'яті (він ще не на сторінці)

```js
    if (lineData.cls) div.classList.add('t-' + lineData.cls);
```
- `lineData.cls` — значення поля `cls` з об'єкта (наприклад `'cmd'`)
- `'t-' + lineData.cls` — склеювання рядків: `'t-' + 'cmd'` = `'t-cmd'`
- Додаємо CSS-клас до нового `<div>`

```js
    if (lineData.cursor) {
      div.textContent = lineData.text;
      var cur = document.createElement('span');
      cur.classList.add('term-cursor');
      div.appendChild(cur);
    } else {
      div.textContent = lineData.text || '\u00A0';
    }
```
- Якщо рядок має `cursor: true` — додаємо всередину `<span class="term-cursor">` (мигаючий курсор)
- `lineData.text || '\u00A0'` — якщо текст порожній (`''`), використовуємо `\u00A0` (це код символу `&nbsp;` — нерозривний пробіл, щоб рядок мав висоту)

```js
    termBody.appendChild(div);
```
- `.appendChild()` — **вставляємо** новостворений `<div>` всередину `termBody` (він тепер видимий на сторінці!)

```js
    i++;
    termCount.textContent = i + '/' + total + ' lines';

    var delay = lineData.cls === 'cmd' ? 180 : 80;
    setTimeout(addLine, delay);
```
- Оновлюємо лічильник рядків у статус-барі
- `lineData.cls === 'cmd' ? 180 : 80` — **тернарний оператор** (скорочене if/else):
  - `умова ? значення_якщо_так : значення_якщо_ні`
  - Команди друкуються повільніше (180мс) — реалістичніше
- `setTimeout(addLine, delay)` — **запускає `addLine` один раз через `delay` мілісекунд**
  - Відмінність від `setInterval`: `setTimeout` спрацьовує **один раз**, а `setInterval` — **постійно**
  - Але оскільки `addLine` кличе сама себе через `setTimeout` — виходить рекурсивний ланцюжок!

**Запуск тільки при скролі до секції:**
```js
var demoObserver = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting) {
    runTermDemo();
    demoObserver.disconnect();
  }
}, { threshold: 0.3 });
demoObserver.observe(demoSection);
```
- `entries[0]` — перший (і єдиний) елемент у списку (ми стежимо тільки за одним)
- `demoObserver.disconnect()` — повністю зупиняємо спостерігача (більше не потрібен)

---

## 8. Функція 5 — Підсвічування активного посилання

**Мета:** Коли користувач перебуває у певній секції, відповідне посилання в navbar підсвічується зеленим.

```js
var navAnchors = document.querySelectorAll('.nav-links a');
var sections   = document.querySelectorAll('section[id]');
```
- `.nav-links a` — всі посилання `<a>` всередині `.nav-links`
- `section[id]` — всі `<section>` що мають атрибут `id`

```js
var sectionObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      navAnchors.forEach(function (a) {
        a.classList.toggle(
          'nav-link--active',
          a.getAttribute('href') === '#' + entry.target.id
        );
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
```

- `entry.target.id` — `id` секції, що зараз видима (наприклад `'features'`)
- `a.getAttribute('href')` — значення атрибуту `href` посилання (наприклад `'#features'`)
- `'#' + entry.target.id` — склеюємо `'#'` і `'features'` → `'#features'`
- Порівняння `===` — **суворе рівняння** (значення І тип мають збігатися)
- `.toggle(клас, умова)` — якщо умова `true` — додає клас, якщо `false` — видаляє

```js
rootMargin: '-40% 0px -50% 0px'
```
- `rootMargin` — "відступ" для зони спрацювання (як CSS `margin`, але для IntersectionObserver)
- `-40% 0px -50% 0px` — зона спрацювання: посередині екрану (між 40% і 50% від верху)
- Це означає: секція вважається "активною" коли вона в центрі екрану

```js
sections.forEach(function (sec) { sectionObserver.observe(sec); });
```
↑ Починаємо стежити за кожною секцією.

---

## 9. Словник термінів

| Термін | Пояснення |
|---|---|
| **DOM** | Document Object Model — JS-представлення всієї HTML-сторінки як дерева об'єктів |
| **Element** | Один HTML-тег у DOM (наприклад `<nav>`, `<div>`, `<p>`) |
| **Event** | Подія: клік, скрол, введення тексту тощо |
| **EventListener** | "Слухач" події — функція, яка запускається коли подія відбувається |
| **Callback** | Функція, яку передають як аргумент і викликають пізніше |
| **Array** | Список значень: `[1, 2, 3]` або `['a', 'b', 'c']` |
| **Object** | Набір пар ключ-значення: `{ name: 'Oleg', age: 25 }` |
| **Method** | Функція, що належить об'єкту: `array.forEach(...)` |
| **setTimeout** | Запускає функцію один раз через N мілісекунд |
| **setInterval** | Запускає функцію кожні N мілісекунд |
| **clearInterval** | Зупиняє setInterval |
| **classList** | Список CSS-класів елемента з методами add/remove/toggle |
| **textContent** | Текстовий вміст елемента (без HTML-тегів) |
| **appendChild** | Вставляє дочірній елемент всередину батьківського |
| **createElement** | Створює новий HTML-елемент у пам'яті |
| **IntersectionObserver** | Слідкує за тим, чи видимий елемент у viewport |
| **threshold** | Поріг видимості для IntersectionObserver (0.0 до 1.0) |
| **rootMargin** | Відступ зони спрацювання IntersectionObserver |
| **===** | Суворе рівняння (значення і тип) |
| **\|\|** | Логічне АБО: повертає перше "правдиве" значення |
| **?:** | Тернарний оператор (скорочений if/else) |
| **++** | Збільшити значення на 1 (index++ = index = index + 1) |
| **+=** | Додати до значення (x += 5 = x = x + 5) |
| **localStorage** | Вбудоване сховище браузера для збереження даних між сесіями |
| **setItem / getItem** | Методи localStorage: записати / прочитати значення за ключем |
| **setAttribute** | Встановлює HTML-атрибут на елементі: `el.setAttribute('data-theme', 'amber')` |
| **removeAttribute** | Видаляє HTML-атрибут з елемента |
| **IIFE** | Immediately Invoked Function Expression — функція що викликає себе одразу після оголошення: `(function(){...})()` |
| **data-*** | Кастомні HTML-атрибути для зберігання даних: `data-theme`, `data-reveal` тощо |
| **CSS змінна (--accent)** | Змінна у CSS: оголошується як `--accent: #00ff88`, використовується як `var(--accent)` |
| **.replace()** | Метод рядка: замінює частину тексту — `'t-amber'.replace('t-', '')` → `'amber'` |

---

> **Підсумок:** Весь JavaScript у RE.cipe побудований на 6 принципах:
> 1. Знайди елемент → `getElementById` / `querySelectorAll`
> 2. Підпишись на подію → `addEventListener`
> 3. Зміни стан → `classList.add/remove/toggle`
> 4. Створюй динамічний вміст → `createElement` + `appendChild`
> 5. Керуй часом → `setTimeout` / `setInterval`
> 6. Стеж за позицією → `IntersectionObserver`
