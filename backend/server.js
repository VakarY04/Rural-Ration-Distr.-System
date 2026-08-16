import dns from 'dns';
// Force Node.js to resolve IPv4 addresses first, fixing the Atlas ECONNREFUSED bug
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

// Fire up MongoDB core link
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '3mb' }));

// Mount production routing matrix
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`[Server] Live in ${process.env.NODE_ENV} environment configuration running on port ${PORT}`);
});