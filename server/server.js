require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'https://seriyspray.github.io'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/recipes',     require('./routes/recipes'));
app.use('/api/folders',     require('./routes/folders'));
app.use('/api/planner',     require('./routes/planner'));
app.use('/api/ingredients', require('./routes/ingredients'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
