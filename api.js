(function() {
  // ── API Configuration ───────────────────────────────────────────
  // This script detects the correct backend URL based on how you access the frontend.

  var host = window.location.hostname;
  
  // 1. Detect if we are running locally on the server machine
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';

  // 2. Determine the backend IP
  // If we access the frontend via an IP (e.g. 192.168.31.100), use that same IP for the backend.
  // Otherwise, fallback to the known server IP.
  var backendIP = isLocal ? 'localhost' : (host.match(/^\d+\.\d+\.\d+\.\d+$/) ? host : '192.168.31.100');

  window.API = 'http://' + backendIP + ':3000';

  console.log('[api] Frontend Host:', host || 'local_file');
  console.log('[api] Backend Target:', window.API);
})();

window.apiFetch = async function(path, options) {
  options = options || {};
  var token = localStorage.getItem('recipe-token');
  var headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (options.headers) Object.assign(headers, options.headers);

  var res;
  try {
    console.log('[api] Fetching:', window.API + path);
    res = await fetch(window.API + path, Object.assign({}, options, { headers: headers }));
  } catch (e) {
    console.error('[api] Fetch error:', e);
    throw new Error('server_unavailable');
  }

  if (res.status === 401) {
    localStorage.removeItem('recipe-token');
    localStorage.removeItem('recipe-user');
    window.location.href = 'auth.html';
    return null;
  }

  return res;
};
