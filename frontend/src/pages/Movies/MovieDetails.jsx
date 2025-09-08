import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetMovieQuery,
  useAddReviewMutation,
  useLikeReviewMutation,
  useDislikeReviewMutation,
  useReportReviewMutation,
  useDeleteMovieMutation,      // 👈 NEW
  useDeleteReviewMutation,     // 👈 NEW
} from "../../redux/api/movies";
import { useBlockUserMutation } from "../../redux/api/users"; // 👈 NEW
import { addToWatchlist, removeFromWatchlist } from "../../redux/features/movies/moviesSlice";
import { useState, useMemo } from "react";
import { toast } from "react-toastify";

const FALLBACK = "https://dummyimage.com/600x900/222/fff.jpg&text=No+Image";

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((s) => s.auth || {});
  const isAdmin = !!userInfo?.isAdmin;

  const { data: movie, isLoading, isError, refetch } = useGetMovieQuery(id);
  const watchlist = useSelector((s) => s.movies?.watchlist || []);
  const inWatchlist = !!watchlist.find((m) => m._id === id);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [addReview, { isLoading: reviewing }] = useAddReviewMutation();
  const [likeReview] = useLikeReviewMutation();
  const [dislikeReview] = useDislikeReviewMutation();
  const [reportReview] = useReportReviewMutation();

  // NEW admin mutations
  const [deleteMovie, { isLoading: deleting }] = useDeleteMovieMutation();
  const [deleteReview, { isLoading: deletingReview }] = useDeleteReviewMutation();
  const [blockUser, { isLoading: blocking }] = useBlockUserMutation();

  const { avgRating, numReviews } = useMemo(() => {
    const list = movie?.reviews || [];
    const countFromReviews = list.length;
    const avgFromReviews =
      countFromReviews > 0
        ? Math.round((list.reduce((s, r) => s + Number(r?.rating || 0), 0) / countFromReviews) * 10) / 10
        : 0;
    const avg = typeof movie?.avgRating === "number" ? movie.avgRating : avgFromReviews;
    const cnt = typeof movie?.numReviews === "number" ? movie.numReviews : countFromReviews;
    return { avgRating: avg, numReviews: cnt };
  }, [movie?.avgRating, movie?.numReviews, movie?.reviews]);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !movie) return <div className="p-6 text-red-400">Failed to load movie.</div>;

  const poster = movie.image || FALLBACK;

  const toggleWatchlist = () => {
    if (inWatchlist) dispatch(removeFromWatchlist(movie._id));
    else dispatch(addToWatchlist(movie));
  };

  const requireAuth = () => {
    toast.info(
      <span>
        Please <Link to="/login" className="underline">log in</Link> or{" "}
        <Link to="/register" className="underline">sign up</Link> to write a review.
      </span>
    );
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      requireAuth();
      return;
    }
    try {
      await addReview({ id: movie._id, rating, comment }).unwrap();
      toast.success("Review added");
      setComment("");
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || "Failed to add review");
    }
  };

  const handleLike = async (rid) => {
    if (!userInfo) return requireAuth();
    try {
      await likeReview({ id: movie._id, reviewId: rid }).unwrap();
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || "Failed to like");
    }
  };
  const handleDislike = async (rid) => {
    if (!userInfo) return requireAuth();
    try {
      await dislikeReview({ id: movie._id, reviewId: rid }).unwrap();
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || "Failed to dislike");
    }
  };
  const handleReport = async (rid) => {
    if (!userInfo) return requireAuth();
    try {
      await reportReview({ id: movie._id, reviewId: rid, reason: "abusive/misleading" }).unwrap();
      toast.success("Reported");
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || "Failed to report");
    }
  };

  // --- Admin actions ---
  const handleDeleteMovie = async () => {
    if (!isAdmin) return;
    if (!confirm(`Delete "${movie.name}"? This cannot be undone.`)) return;
    try {
      await deleteMovie(movie._id).unwrap();
      toast.success("Movie deleted");
      navigate("/movies");
    } catch (e) {
      toast.error(e?.data?.message || "Failed to delete movie");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!isAdmin) return;
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview({ id: movie._id, reviewId }).unwrap();
      toast.success("Review deleted");
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || "Failed to delete review");
    }
  };

  const handleBlockUser = async (userId) => {
    if (!isAdmin || !userId) return;
    if (!confirm("Block this user from posting further reviews?")) return;
    try {
      await blockUser({ userId, blocked: true }).unwrap();
      toast.success("User blocked");
      // optional: refresh any user-related listings
    } catch (e) {
      toast.error(e?.data?.message || "Failed to block user");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-6">
      <img src={poster} alt={movie.name} className="rounded-xl w-full object-cover" />
      <div>
        <div className="flex items-start gap-3">
          <h1 className="text-3xl font-semibold">{movie.name}</h1>
          <span className="mt-1 text-sm px-2 py-1 rounded-full border border-white/10">
            ⭐ {avgRating?.toFixed?.(1) ?? Number(avgRating || 0).toFixed(1)}{" "}
            <span className="opacity-70">({numReviews})</span>
          </span>
        </div>
        <p className="opacity-80 mt-1">
          {movie.year} • {movie.genres?.join(", ")}
        </p>

        {/* Cast */}
        {Array.isArray(movie.cast) && movie.cast.length > 0 && (
          <div className="mt-3">
            <h3 className="font-medium mb-1">Cast</h3>
            <div className="flex flex-wrap gap-2">
              {movie.cast.map((c, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full border border-white/10">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 opacity-90">{movie.detail}</p>

        <div className="mt-4 flex gap-2">
          {/* Only logged-in non-admins can watchlist */}
          {!isAdmin && (
            <button
              onClick={() => {
                if (!userInfo) return requireAuth();
                toggleWatchlist();
              }}
              className="px-3 py-1 rounded-xl border border-white/10"
            >
              {inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            </button>
          )}
          {movie.trailerUrl && (
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 rounded-xl border border-white/10"
            >
              Watch Trailer
            </a>
          )}
        </div>

        {/* ADMIN: Danger Zone */}
        {isAdmin && (
          <div className="mt-6 border border-red-500/30 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-red-300 font-semibold">CAUTION! ⚠️</h3>
              <button
                onClick={handleDeleteMovie}
                disabled={deleting}
                className="px-3 py-1 rounded-xl border border-red-500/50 text-red-300 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete Movie"}
              </button>
            </div>
            <p className="text-xs opacity-70 mt-1">Deleting the movie removes all its reviews.</p>
          </div>
        )}

        <h2 className="text-xl font-semibold mt-8 mb-2">Reviews</h2>

        {/* Review form (hidden for admins) */}
        {!isAdmin && (
          <form onSubmit={submitReview} className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <label>Rating:</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 w-24"
                disabled={!userInfo}
              />
            </div>
            <textarea
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={userInfo ? "Write a review…" : "Log in to write a review…"}
              disabled={!userInfo}
            />
            <div className="flex items-center gap-3">
              <button
                disabled={reviewing || !userInfo}
                className="px-3 py-1 rounded-xl border border-white/10 disabled:opacity-60"
              >
                {reviewing ? "Submitting…" : "Submit review"}
              </button>
              {!userInfo && (
                <Link to="/login" className="px-3 py-1 rounded-xl border border-white/10">
                  Login / Sign up
                </Link>
              )}
            </div>
          </form>
        )}

        <div className="space-y-2">
          {(movie.reviews || []).map((r) => (
            <div key={r._id} className="bg-zinc-900 rounded-xl p-3">
              <div className="text-sm flex items-center justify-between">
                <span>
                  {r.name} — ⭐ {r.rating}
                </span>

                {/* User controls */}
                {!isAdmin && (
                  <div className="flex gap-2 text-xs">
                    <button onClick={() => handleLike(r._id)} className="underline opacity-80">
                      Helpful ({r.upvotes || 0})
                    </button>
                    <button onClick={() => handleDislike(r._id)} className="underline opacity-80">
                      Not helpful ({r.downvotes || 0})
                    </button>
                    <button onClick={() => handleReport(r._id)} className="underline text-red-400">
                      Report
                    </button>
                  </div>
                )}

                {/* Admin controls per review */}
                {isAdmin && (
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => handleDeleteReview(r._id)}
                      disabled={deletingReview}
                      className="underline text-red-300 disabled:opacity-60"
                    >
                      {deletingReview ? "Deleting…" : "Delete"}
                    </button>
                    {r.user && (
                      <button
                        onClick={() => handleBlockUser(r.user)}
                        disabled={blocking}
                        className="underline text-amber-300 disabled:opacity-60"
                      >
                        {blocking ? "Blocking…" : "Block User"}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="text-sm opacity-80 mt-1">{r.comment}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
