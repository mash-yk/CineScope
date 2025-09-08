import Movie from "../models/Movie.js";

/**
 * GET /api/v1/movies
 * Query: genre, year, minRating, q
 */
export const listMovies = async (req, res, next) => {
  try {
    const { genre, year, minRating, q } = req.query;
    const filter = {};
    if (genre) filter.genres = { $in: [genre] };
    if (year) filter.year = Number(year);
    if (minRating) filter.avgRating = { $gte: Number(minRating) };
    if (q) filter.name = { $regex: new RegExp(q, "i") };
    const movies = await Movie.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(movies);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/movies/top
 */
export const topMovies = async (_req, res, next) => {
  try {
    const movies = await Movie.find({}).sort({ avgRating: -1, numReviews: -1 }).limit(50);
    res.json(movies);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/movies/new
 */
export const newMovies = async (_req, res, next) => {
  try {
    const movies = await Movie.find({}).sort({ createdAt: -1 }).limit(50);
    res.json(movies);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/movies/random
 */
export const randomMovies = async (_req, res, next) => {
  try {
    const count = await Movie.countDocuments();
    const size = Math.min(20, count);
    const skip = Math.max(0, Math.floor(Math.random() * Math.max(1, count - size)));
    const movies = await Movie.find({}).skip(skip).limit(size);
    res.json(movies);
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/movies/:id
 */
export const getSpecificMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/movies/:id/reviews
 * Body: { rating, comment }
 */
export const addMovieReview = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    const { rating, comment } = req.body || {};
    if (rating == null) return res.status(400).json({ message: "Rating is required" });
    const exists = movie.reviews.find((r) => String(r.user) === String(req.user._id));
    if (exists) return res.status(400).json({ message: "Already reviewed" });
    movie.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment: comment || "" });
    movie.recomputeRating();
    await movie.save();
    res.status(201).json({ message: "Review added" });
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/movies/:id/reviews/:reviewId/like
 */
export const likeReview = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    const r = movie.reviews.id(req.params.reviewId);
    if (!r) return res.status(404).json({ message: "Review not found" });
    if (r.voters?.find((v) => String(v) === String(req.user._id))) return res.status(400).json({ message: "Already voted" });
    r.upvotes = (r.upvotes || 0) + 1;
    r.voters = r.voters || [];
    r.voters.push(req.user._id);
    await movie.save();
    res.json({ message: "Liked" });
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/movies/:id/reviews/:reviewId/dislike
 */
export const dislikeReview = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    const r = movie.reviews.id(req.params.reviewId);
    if (!r) return res.status(404).json({ message: "Review not found" });
    if (r.voters?.find((v) => String(v) === String(req.user._id))) return res.status(400).json({ message: "Already voted" });
    r.downvotes = (r.downvotes || 0) + 1;
    r.voters = r.voters || [];
    r.voters.push(req.user._id);
    await movie.save();
    res.json({ message: "Disliked" });
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/movies/:id/reviews/:reviewId/report
 */
export const reportReview = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    const r = movie.reviews.id(req.params.reviewId);
    if (!r) return res.status(404).json({ message: "Review not found" });
    r.reports = r.reports || [];
    r.reports.push({ user: req.user._id, reason: req.body?.reason || "abusive/misleading" });
    await movie.save();
    res.json({ message: "Reported" });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/v1/movies/:id/reviews/:reviewId  (admin)
 */
export const deleteReview = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    const r = movie.reviews.id(req.params.reviewId);
    if (!r) return res.status(404).json({ message: "Review not found" });
    r.deleteOne();
    movie.recomputeRating();
    await movie.save();
    res.json({ message: "Review deleted" });
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/movies  (admin)
 */
export const createMovie = async (req, res, next) => {
  try {
    const m = await Movie.create({
      name: req.body.name,
      detail: req.body.detail || "",
      image: req.body.image || "",
      trailerUrl: req.body.trailerUrl || "",
      year: req.body.year,
      genres: Array.isArray(req.body.genres) ? req.body.genres : (req.body.genres ? [req.body.genres] : []),
      cast: Array.isArray(req.body.cast) ? req.body.cast : (req.body.cast ? [req.body.cast] : []),
    });
    res.status(201).json(m);
  } catch (err) { next(err); }
};

/**
 * PUT /api/v1/movies/:id  (admin)
 */
export const updateMovie = async (req, res, next) => {
  try {
    const m = await Movie.findById(req.params.id);
    if (!m) return res.status(404).json({ message: "Movie not found" });
    m.name = req.body.name ?? m.name;
    m.detail = req.body.detail ?? m.detail;
    m.image = req.body.image ?? m.image;
    m.trailerUrl = req.body.trailerUrl ?? m.trailerUrl;
    m.year = req.body.year ?? m.year;
    if (req.body.genres) m.genres = Array.isArray(req.body.genres) ? req.body.genres : [req.body.genres];
    if (req.body.cast) m.cast = Array.isArray(req.body.cast) ? req.body.cast : [req.body.cast];
    await m.save();
    res.json(m);
  } catch (err) { next(err); }
};

/**
 * DELETE /api/v1/movies/:id  (admin)
 */
export const deleteMovie = async (req, res, next) => {
  try {
    const m = await Movie.findById(req.params.id);
    if (!m) return res.status(404).json({ message: "Movie not found" });
    await m.deleteOne();
    res.json({ message: "Movie removed" });
  } catch (err) { next(err); }
};
