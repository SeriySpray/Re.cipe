// ─── RE.cipe: Main Script ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  console.log('RE.cipe: System startup...');

  // 1. THEME SWITCHER
  var themeRadios = document.querySelectorAll('.theme-radio');
  
  themeRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      var theme = radio.id.replace('t-', '');
      if (theme === 'green') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', theme);
      }
      localStorage.setItem('recipe-theme', theme);
      console.log('Theme changed to:', theme);
    });
  });

  // Restore saved theme
  (function () {
    var saved = localStorage.getItem('recipe-theme');
    if (saved && saved !== 'green') {
      document.body.setAttribute('data-theme', saved);
      var radio = document.getElementById('t-' + saved);
      if (radio) radio.checked = true;
    }
  })();

  // 2. TYPING ANIMATION
  function typeText(element, text, speed, onDone) {
    if (!element) return;
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

  if (heroSub) heroSub.style.opacity = '0';
  if (heroCta) heroCta.style.opacity = '0';

  if (eyebrow) {
    var originalText = eyebrow.textContent || '// terminal-style recipe management';
    typeText(eyebrow, originalText, 35, function () {
      if (heroSub) {
        heroSub.style.transition = 'opacity 0.5s';
        heroSub.style.opacity = '1';
      }
      if (heroCta) {
        heroCta.style.transition = 'opacity 3s 0.2s';
        heroCta.style.opacity = '1';
      }
    });
  }

  // 4. SCROLL-REVEAL
  var revealElements = document.querySelectorAll('[data-reveal]');
  revealElements.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
  });

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // 5. TERMINAL DEMO
  var termLinesData = [
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
  var demoStarted = false;

  function runTermDemo() {
    if (demoStarted || !termBody) return;
    demoStarted = true;
    var i = 0;
    function addLine() {
      if (i >= termLinesData.length) {
        if (termStatus) termStatus.textContent = 'DONE';
        return;
      }
      var lineData = termLinesData[i];
      var div = document.createElement('div');
      if (lineData.cls) div.classList.add('t-' + lineData.cls);
      if (lineData.cursor) {
        div.textContent = lineData.text;
        var cur = document.createElement('span');
        cur.classList.add('term-cursor');
        div.appendChild(cur);
      } else {
        div.textContent = lineData.text || '\u00A0';
      }
      termBody.appendChild(div);
      termBody.scrollTop = termBody.scrollHeight;
      i++;
      if (termCount) termCount.textContent = i + '/' + termLinesData.length + ' lines';
      var delay = lineData.cls === 'cmd' ? 360 : 160;
      setTimeout(addLine, delay);
    }
    addLine();
  }

  var demoSection = document.getElementById('demo');
  if (demoSection) {
    var demoObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        runTermDemo();
        demoObserver.disconnect();
      }
    }, { threshold: 0.3 });
    demoObserver.observe(demoSection);
  }

  // 6. ACTIVE NAV LINK
  var navAnchors = document.querySelectorAll('.nav-links a');
  var sections   = document.querySelectorAll('section[id]');
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        navAnchors.forEach(function (a) {
          a.classList.toggle('nav-link--active', a.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(function (sec) { sectionObserver.observe(sec); });

  // 7. INTERACTIVE GRID CANVAS (Moved inside DOMContentLoaded)
  (function() {
    var canvas = document.getElementById('gridCanvas');
    if (!canvas) {
      console.log('Grid canvas not found, skipping background animation.');
      return;
    }
    console.log('Initializing interactive grid...');
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
      var parallaxItems = document.querySelectorAll('[data-speed]');
      parallaxItems.forEach(function (item) {
        var speed = parseFloat(item.getAttribute('data-speed'));
        var yPos = -(scrollY * speed);
        item.style.transform = 'translateY(' + yPos + 'px)';
      });
    });
    
    resize();

    var dotGap = 32;
    var avoidanceRadius = 45;
    var glowRadius = 110;
    
    function getAccentColor() {
      var style = getComputedStyle(document.body);
      var color = style.getPropertyValue('--accent').trim();
      if (color.startsWith('#')) {
        var r = parseInt(color.slice(1, 3), 16);
        var g = parseInt(color.slice(3, 5), 16);
        var b = parseInt(color.slice(5, 7), 16);
        return { r: r, g: g, b: b };
      }
      var match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
      }
      return { r: 0, g: 255, b: 136 };
    }

    var baseColor = getAccentColor();
    var themeObserver = new MutationObserver(function() { 
      baseColor = getAccentColor();
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var offsetY = -(scrollY * 0.1) % dotGap;
      for (var x = 0; x < canvas.width + dotGap; x += dotGap) {
        for (var y = 0; y < canvas.height + dotGap; y += dotGap) {
          var dotX = x;
          var dotY = y + offsetY;
          var dx = dotX - mouse.x;
          var dy = dotY - mouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var drawX = dotX;
          var drawY = dotY;
          var opacity = 0.15;
          var radius = 1.4;
          if (dist < avoidanceRadius) {
            var force = (avoidanceRadius - dist) / avoidanceRadius;
            drawX += (dx / dist) * force * 12; 
            drawY += (dy / dist) * force * 12;
          }
          if (dist < glowRadius) {
            var glow = (glowRadius - dist) / glowRadius;
            opacity += Math.pow(glow, 1.5) * 0.85; 
            radius += glow * 1.3;
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
});