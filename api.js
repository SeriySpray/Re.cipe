var API = 'http://localhost:3000';

async function apiFetch(path, options) {
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
