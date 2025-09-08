import express from 'express';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  addToWatchlist,
  removeFromWatchlist,
  getRecommendations,
  listUsers,
  setBlockUser,
} from '../controllers/userController.js';

const router = express.Router();

// public
router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// auth
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/watchlist', authenticate, addToWatchlist);
router.delete('/watchlist/:movieId', authenticate, removeFromWatchlist);
router.get('/recommendations', authenticate, getRecommendations);

// admin
router.get('/', authenticate, authorizeAdmin, listUsers);
router.patch('/:id/block', authenticate, authorizeAdmin, setBlockUser);

export default router;
