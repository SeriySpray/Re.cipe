require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const originalQuery = pool.query.bind(pool);

pool.query = function (text, params) {
  const start = Date.now();
  const promise = originalQuery(text, params);
  promise.then(() => {
    console.log(`[db] ${Date.now() - start}ms | ${text.replace(/\s+/g, ' ').trim()}`);
  }).catch(() => {
    console.log(`[db] ERR | ${text.replace(/\s+/g, ' ').trim()}`);
  });
  return promise;
};

module.exports = pool;
