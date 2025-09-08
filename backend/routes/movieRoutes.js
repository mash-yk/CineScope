import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import {
  listMovies, topMovies, newMovies, randomMovies, getSpecificMovie,
  addMovieReview, likeReview, dislikeReview, reportReview, deleteReview, createMovie, updateMovie, deleteMovie
} from "../controllers/movieController.js";

const router = express.Router();

router.get("/", listMovies);
router.get("/top", topMovies);
router.get("/new", newMovies);
router.get("/random", randomMovies);
router.get("/:id", getSpecificMovie);

router.post("/", authenticate, authorizeAdmin, createMovie);
router.put("/:id", authenticate, authorizeAdmin, updateMovie);
router.delete("/:id", authenticate, authorizeAdmin, deleteMovie);

router.post("/:id/reviews", authenticate, addMovieReview);
router.post("/:id/reviews/:reviewId/like", authenticate, likeReview);
router.post("/:id/reviews/:reviewId/dislike", authenticate, dislikeReview);
router.post("/:id/reviews/:reviewId/report", authenticate, reportReview);
router.delete("/:id/reviews/:reviewId", authenticate, authorizeAdmin, deleteReview);

export default router;
