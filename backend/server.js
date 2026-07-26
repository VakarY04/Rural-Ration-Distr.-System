import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes.js'; // IMPORT NEW ROUTER MAP

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// REGISTER APPLICATION API ROUTE MIDDLEWARES
app.use('/api/bookings', bookingRoutes);

// Basic system architecture diagnostics health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Running',
    dataSource: process.env.DATA_SOURCE,
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Data isolation source layer active: [${process.env.DATA_SOURCE}]`);
});