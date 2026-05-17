//THEME SWITCHER: зміна кольору всього сайту
var themeRadios = document.querySelectorAll('.theme-radio');

const button = document.getElementsByClassName("btn.btn-primary.large");
button.style.

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

// ─── 7. INTERACTIVE GRID CANVAS ──────────────────────────────
(function() {
  var canvas = document.getElementById('gridCanvas');
  var ctx = canvas.getContext('2d');
  var mouse = { x: -1000, y: -1000 };
  var scrollY = window.pageYOffset;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('scroll', function() {
    scrollY = window.pageYOffset;
    
    // Рух окремих елементів з атрибутом data-speed (залишаємо як було)
    var parallaxItems = document.querySelectorAll('[data-speed]');
    parallaxItems.forEach(function (item) {
      var speed = parseFloat(item.getAttribute('data-speed'));
      var yPos = -(scrollY * speed);
      item.style.transform = 'translateY(' + yPos + 'px)';
    });
  });
  
  resize();

  var dotGap = 32;
  var avoidanceRadius = 45; // Ще менший радіус деформації
  var glowRadius = 110;     // Ще менший радіус підсвітки
  
  // Функція для отримання поточного кольору теми
  function getAccentColor() {
    var style = getComputedStyle(document.body);
    var hex = style.getPropertyValue('--accent').trim();
    
    // Перетворюємо HEX у RGB для Canvas
    if (hex.startsWith('#')) {
      var r = parseInt(hex.slice(1, 3), 16);
      var g = parseInt(hex.slice(3, 5), 16);
      var b = parseInt(hex.slice(5, 7), 16);
      return { r: r, g: g, b: b };
    }
    return { r: 0, g: 255, b: 136 }; // fallback
  }

  var baseColor = getAccentColor();

  // Оновлюємо колір при зміні теми (спостерігач за атрибутами)
  var themeObserver = new MutationObserver(function() {
    baseColor = getAccentColor();
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    var offsetX = 0;
    var offsetY = -(scrollY * 0.1) % dotGap;
    
    // Малюємо сітку
    for (var x = 0; x < canvas.width + dotGap; x += dotGap) {
      for (var y = 0; y < canvas.height + dotGap; y += dotGap) {
        var dotX = x + offsetX;
        var dotY = y + offsetY;
        
        var dx = dotX - mouse.x;
        var dy = dotY - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        
        var drawX = dotX;
        var drawY = dotY;
        var opacity = 0.12; 
        var radius = 1.3;
        
        if (dist < avoidanceRadius) {
          var force = (avoidanceRadius - dist) / avoidanceRadius;
          drawX += (dx / dist) * force * 12; 
          drawY += (dy / dist) * force * 12;
        }

        if (dist < glowRadius) {
          var glow = (glowRadius - dist) / glowRadius;
          // Посилюємо яскравість та розмір для ефекту світіння
          opacity += Math.pow(glow, 1.5) * 0.88; 
          radius += glow * 1.2; // Точки збільшуються при наближенні курсору
        }
        
        ctx.fillStyle = 'rgba(' + baseColor.r + ',' + baseColor.g + ',' + baseColor.b + ',' + Math.min(opacity, 1) + ')';
        ctx.beginPath();
        ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
})();
