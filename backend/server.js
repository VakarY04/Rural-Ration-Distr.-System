import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js'; // DNS pinning + IPv4 handled inside
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// Fire up MongoDB core link
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '3mb' }));

// Mount production routing matrix
app.use('/api', apiRoutes);

// JSON error handler must be registered after all routes
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`[Server] Live in ${process.env.NODE_ENV} environment configuration running on port ${PORT}`);
});

// Fail loudly (and let nodemon exit cleanly) instead of silently hanging on
// "app crashed — waiting for file changes" when the port is already taken
// (e.g. another `node server.js` / AI Fit already bound to 5000).
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[Server] Port ${PORT} is already in use. Stop the other process ` +
        `(or set a different PORT in backend/.env) and retry.`
    );
  } else {
    console.error(`[Server] Failed to start: ${err.message}`);
  }
  process.exit(1);
});