// Already logged in → skip auth page
if (localStorage.getItem('recipe-token')) {
  window.location.href = 'app.html';
}

function setAuthStatus(panel, msg) {
  var el = document.querySelector('.auth-status-' + panel);
  if (el) el.textContent = msg;
}

// ── Login ─────────────────────────────────────────────────────────

var loginForm = document.querySelector('.login-panel .auth-form');

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  var email    = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;

  if (!email || !password) {
    setAuthStatus('login', 'ERR — email and password required');
    return;
  }

  setAuthStatus('login', 'CONNECTING...');

  try {
    var res  = await window.apiFetch('/api/auth/login', {
      method:  'POST',
      body:    JSON.stringify({ email: email, password: password })
    });
    
    if (!res) return; // Handled by apiFetch (e.g. 401)
    var data = await res.json();

    if (!res.ok) {
      setAuthStatus('login', 'ERR — ' + (data.error || 'login failed'));
      return;
    }

    localStorage.setItem('recipe-token', data.token);
    localStorage.setItem('recipe-user',  data.user.display_name || data.user.email);
    window.location.href = 'app.html';
  } catch (e) {
    setAuthStatus('login', 'ERR — server unavailable');
  }
});

// ── Register ──────────────────────────────────────────────────────

var registerForm = document.querySelector('.register-panel .auth-form');

registerForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  var username = document.getElementById('reg-username').value.trim();
  var email    = document.getElementById('reg-email').value.trim();
  var password = document.getElementById('reg-password').value;
  var confirm  = document.getElementById('reg-confirm').value;

  if (!email || !password) {
    setAuthStatus('register', 'ERR — email and password required');
    return;
  }

  if (password !== confirm) {
    setAuthStatus('register', 'ERR — passwords do not match');
    return;
  }

  setAuthStatus('register', 'CONNECTING...');

  try {
    var res  = await window.apiFetch('/api/auth/register', {
      method:  'POST',
      body:    JSON.stringify({ email: email, password: password, display_name: username })
    });

    if (!res) return;
    var data = await res.json();

    if (!res.ok) {
      setAuthStatus('register', 'ERR — ' + (data.error || 'registration failed'));
      return;
    }

    localStorage.setItem('recipe-token', data.token);
    localStorage.setItem('recipe-user',  data.user.display_name || data.user.email);
    window.location.href = 'app.html';
  } catch (e) {
    setAuthStatus('register', 'ERR — server unavailable');
  }
});
