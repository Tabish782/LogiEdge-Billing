const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { PORT } = require('./src/config/env');
const { pool } = require('./src/config/db');
const { initializeDatabase } = require('./src/services/databaseSetup');
const { createApiRouter } = require('./src/routes/api');

const app = express();

// ✅ FIXED CORS (FINAL)
const allowedOrigins = [
  "http://localhost:5173",
  "https://logi-edge-billing.vercel.app",
  "https://logi-edge-billing-git-main-ahmedtabish1212-6507s-projects.vercel.app",
  "https://logi-edge-billing-ncl8bugf7-ahmedtabish1212-6507s-projects.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / curl
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
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