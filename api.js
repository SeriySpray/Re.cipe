// Replace this with your actual server IP (from ipconfig / ifconfig)
// Example: 'http://192.168.31.100:3000'
var API_HOST = 'http://192.168.31.100:3000';

// Use localhost if we are on the same machine, otherwise use the network IP
window.API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : API_HOST;

window.apiFetch = async function(path, options) {
  options = options || {};
  var token = localStorage.getItem('recipe-token');
  var headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (options.headers) Object.assign(headers, options.headers);

  var res;
  try {
    res = await fetch(API + path, Object.assign({}, options, { headers: headers }));
  } catch (e) {
    throw new Error('server_unavailable');
  }

  if (res.status === 401) {
    localStorage.removeItem('recipe-token');
    localStorage.removeItem('recipe-user');
    window.location.href = 'auth.html';
    return null;
  }

  return res;
}
