import connectDB from './db.js';
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import genreRoutes from './routes/genreRoutes.js';

connectDB();

const app = express();

// allow frontend dev server
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// body + cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// health
app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

// routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/genres', genreRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error('❌ API error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
