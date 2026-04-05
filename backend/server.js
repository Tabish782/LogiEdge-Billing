const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { PORT, FRONTEND_ORIGIN } = require('./src/config/env');
const { pool } = require('./src/config/db');
const { initializeDatabase } = require('./src/services/databaseSetup');
const { createApiRouter } = require('./src/routes/api');

const app = express();

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

app.use('/api', createApiRouter(pool));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message:
      'Something went wrong while processing the request. Please check your MySQL settings.',
  });
});

initializeDatabase(pool)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  });
