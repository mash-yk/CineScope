import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Movie from '../models/Movie.js';

// REGISTER
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password });
    generateToken(res, user._id);
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
  } catch (err) { next(err); }
};

// LOGIN (block blocked users)
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked' });
      generateToken(res, user._id);
      res.json({ _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) { next(err); }
};

// LOGOUT
export const logoutUser = async (_req, res) => {
  res.clearCookie('jwt');
  res.json({ message: 'Logged out' });
};

// PROFILE (GET)
export const getProfile = async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id).select('-password');
    res.json({
      _id: u._id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      watchlist: u.watchlist,
      favoriteGenres: u.favoriteGenres,
      isBlocked: !!u.isBlocked,
    });
  } catch (err) { next(err); }
};

// PROFILE (PUT)
export const updateProfile = async (req, res, next) => {
  try {
    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    u.name = req.body.name ?? u.name;
    u.email = req.body.email ?? u.email;
    if (Array.isArray(req.body.favoriteGenres)) {
      u.favoriteGenres = req.body.favoriteGenres.filter(Boolean).slice(0, 10);
    }
    if (req.body.password) u.password = req.body.password;
    await u.save();
    res.json({
      _id: u._id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      favoriteGenres: u.favoriteGenres,
      isBlocked: !!u.isBlocked,
    });
  } catch (err) { next(err); }
};

// WATCHLIST (POST)
export const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.body || {};
    const u = await User.findById(req.user._id);
    if (!movieId) return res.status(400).json({ message: 'movieId required' });
    if (!u.watchlist.find(m => String(m) === String(movieId))) u.watchlist.push(movieId);
    await u.save();
    res.json({ watchlist: u.watchlist });
  } catch (err) { next(err); }
};

// WATCHLIST (DELETE)
export const removeFromWatchlist = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const u = await User.findById(req.user._id);
    u.watchlist = u.watchlist.filter(m => String(m) !== String(movieId));
    await u.save();
    res.json({ watchlist: u.watchlist });
  } catch (err) { next(err); }
};

// RECOMMENDATIONS
export const getRecommendations = async (req, res, next) => {
  try {
    // simple strategy: use user's favoriteGenres if present, else top-rated fallback
    const userDoc = await User.findById(req.user._id).select('favoriteGenres');
    let movies;
    if (userDoc?.favoriteGenres?.length) {
      movies = await Movie.find({ genres: { $in: userDoc.favoriteGenres } })
        .sort({ avgRating: -1, numReviews: -1 })
        .limit(20);
    } else {
      movies = await Movie.find({})
        .sort({ avgRating: -1, numReviews: -1 })
        .limit(20);
    }
    res.json(movies);
  } catch (err) { next(err); }
};

// --- ADMIN: list users
export const listUsers = async (_req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) { next(err); }
};

// --- ADMIN: block/unblock user
export const setBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !!req.body.isBlocked;
    await user.save();
    res.json({ message: user.isBlocked ? 'Blocked' : 'Unblocked' });
  } catch (err) { next(err); }
};
