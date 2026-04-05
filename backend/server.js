const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { PORT } = require('./src/config/env');
const { pool } = require('./src/config/db');
const { initializeDatabase } = require('./src/services/databaseSetup');
const { createApiRouter } = require('./src/routes/api');

const app = express();

// ✅ SMART CORS FIX (FINAL)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests without origin (Postman etc.)
      if (!origin) return callback(null, true);

      // allow localhost (development)
      if (origin.includes("localhost")) {
        return callback(null, true);
      }

      // allow ALL vercel deployments
      if (origin.includes("vercel.app")) {
        return callback(null, true);
      }

      // allow your main domain (optional)
      if (origin === "https://logi-edge-billing.vercel.app") {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.use('/api', createApiRouter(pool));

// global error handler
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
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  });