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
    console.log('[cors] Request from origin:', origin);
    // Allow any origin for local network access and development
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') || 
        origin.includes('192.168.') || 
        origin.includes('seriyspray.github.io')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/recipes',     require('./routes/recipes'));
app.use('/api/folders',     require('./routes/folders'));
app.use('/api/planner',     require('./routes/planner'));
app.use('/api/ingredients', require('./routes/ingredients'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running!`);
  console.log(`- Local:    http://localhost:${PORT}`);
  console.log(`- Network:  http://192.168.31.100:${PORT}`);
});
