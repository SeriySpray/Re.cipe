
//THEME SWITCHER: зміна кольору всього сайту
var themeRadios = document.querySelectorAll('.theme-radio');

themeRadios.forEach(function (radio) {
  radio.addEventListener('change', function () {
    // Беремо назву теми з id кнопки: "t-green" >> "green"
    var theme = radio.id.replace('t-', '');
    if (theme === 'green') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
    // Зберігаємо вибір у localStorage щоб запам'ятати після перезавантаження
    localStorage.setItem('recipe-theme', theme);
  });
});

// Відновлюємо збережену тему при завантаженні сторінки
(function () {
  var saved = localStorage.getItem('recipe-theme');
  if (saved && saved !== 'green') {
    document.body.setAttribute('data-theme', saved);
    var radio = document.getElementById('t-' + saved);
    if (radio) radio.checked = true;
  }
})();

// ─── 2. TYPING ANIMATION: eyebrow у hero ─────────────────────
function typeText(element, text, speed, onDone) {
  var index = 0;
  element.textContent = '';

  var timer = setInterval(function () {
    element.textContent += text[index];
    index++;
    if (index >= text.length) {
      clearInterval(timer);
      if (onDone) onDone();
    }
  }, speed);
}

var eyebrow = document.getElementById('heroEyebrow');
var heroSub = document.getElementById('heroSub');
var heroCta = document.getElementById('heroCta');

// Ланцюжок: спочатку eyebrow → потім показуємо subtitle і CTA
typeText(eyebrow, '// terminal-style recipe management', 35, function () {
  heroSub.style.transition = 'opacity 0.5s';
  heroSub.style.opacity    = '1';
  heroCta.style.transition = 'opacity 3s 0.2s';
  heroCta.style.opacity    = '1';
});

// ─── 4. SCROLL-REVEAL: секції з'являються при скролі ─────────
var revealElements = document.querySelectorAll('[data-reveal]');

var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target); // більше не стежимо
    }
  });
}, { threshold: 0.30});

revealElements.forEach(function (el) {
  revealObserver.observe(el);
});

// ─── 5. TERMINAL DEMO: рядки друкуються по черзі ─────────────
var termLines = [
  { cls: 'cmd',  text: '$ re.cipe --open "My Recipes"' },
  { cls: 'dim',  text: '▼ /My Recipes/' },
  { cls: 'dim',  text: '    ▼ /Pasta/' },
  { cls: 'text', text: '        - Carbonara   [25min **o]' },
  { cls: 'text', text: '        - Lasagna     [90min ***]' },
  { cls: 'dim',  text: '    ▷ /Soups/' },
  { cls: '',     text: '' },
  { cls: 'cmd',  text: '$ re.cipe filter --ingredients eggs bacon' },
  { cls: 'acc',  text: '    [x] eggs    <- 3 recipes' },
  { cls: 'acc',  text: '    [x] bacon   <- 2 recipes' },
  { cls: 'dim',  text: '    [ ] chicken' },
  { cls: 'acc',  text: '> 3 recipes matched ✓' },
  { cls: '',     text: '' },
  { cls: 'cmd',  text: '$ re.cipe shop_list --week' },
  { cls: 'acc',  text: '  -> 14 items across 6 recipes  ✓', cursor: true },
];

var termBody    = document.getElementById('termDemo');
var termStatus  = document.getElementById('termStatus');
var termCount   = document.getElementById('termLines');
var total       = termLines.length;
var demoStarted = false;

function runTermDemo() {
  if (demoStarted) return;
  demoStarted = true;

  var i = 0;

  function addLine() {
    if (i >= total) {
      termStatus.textContent = 'DONE';
      return;
    }

    var lineData = termLines[i];
    var div = document.createElement('div');

    if (lineData.cls) div.classList.add('t-' + lineData.cls);

    if (lineData.cursor) {
      div.textContent = lineData.text;
      var cur = document.createElement('span');
      cur.classList.add('term-cursor');
      div.appendChild(cur);
    } else {
      div.textContent = lineData.text || '\u00A0'; // &nbsp; для порожніх рядків
    }

    termBody.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
    i++;
    termCount.textContent = i + '/' + total + ' lines';

    // Затримка між рядками: команди — повільніше, відповіді — швидше
    var delay = lineData.cls === 'cmd' ? 360 : 160;
    setTimeout(addLine, delay);
  }

  addLine();
}

// Запускаємо demo лише коли секція потрапляє на екран
var demoSection = document.getElementById('demo');
var demoObserver = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting) {
    runTermDemo();
    demoObserver.disconnect();
  }
}, { threshold: 0.3 });
demoObserver.observe(demoSection);

// ─── 6. ACTIVE NAV LINK: підсвічуємо поточну секцію ─────────
var navAnchors = document.querySelectorAll('.nav-links a');
var sections   = document.querySelectorAll('section[id]');

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

sections.forEach(function (sec) { sectionObserver.observe(sec); });
