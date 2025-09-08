import express from 'express';
import Movie from '../models/Movie.js';

const router = express.Router();

router.get('/genres', async (_req, res, next) => {
  try {
    const arr = await Movie.distinct('genres');
    const list = (arr || []).filter(Boolean).sort();
    res.json(list);
  } catch (err) { next(err); }
});

export default router;
