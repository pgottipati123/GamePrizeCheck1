import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GamePriceCheck API is running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`GamePriceCheck API is running on port ${PORT}`);
});
