import { toast } from "react-toastify";
import { useDeleteCommentMutation, useGetAllMoviesQuery } from "../../redux/api/movies";
import { useGetUsersQuery, useBlockUserMutation } from "../../redux/api/users";

const AllComments = () => {
  const { data: movies = [], refetch: refetchMovies, isFetching } = useGetAllMoviesQuery();
  const [deleteComment] = useDeleteCommentMutation();

  const { data: users = [], refetch: refetchUsers, isFetching: loadingUsers } = useGetUsersQuery();
  const [blockUser] = useBlockUserMutation();

  const reported = [];
  for (const m of movies) {
    for (const r of m.reviews || []) {
      if ((r.reports || []).length > 0) {
        reported.push({ movieId: m._id, movieName: m.name, review: r });
      }
    }
  }

  const handleDeleteComment = async (movieId, reviewId) => {
    try {
      await deleteComment({ movieId, reviewId }).unwrap();
      toast.success("Review deleted");
      refetchMovies();
    } catch (e) {
      toast.error(e?.data?.message || "Failed to delete");
    }
  };

  const toggleBlock = async (u) => {
    try {
      await blockUser({ id: u._id, isBlocked: !u.isBlocked }).unwrap();
      toast.success(!u.isBlocked ? "User blocked" : "User unblocked");
      refetchUsers();
    } catch (e) {
      toast.error(e?.data?.message || "Action failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <section>
        <h1 className="text-2xl font-semibold mb-4">Reported Reviews</h1>
        {isFetching ? (
          <p>Loading…</p>
        ) : reported.length === 0 ? (
          <p className="opacity-70 text-sm">No reported reviews.</p>
        ) : (
          <div className="space-y-3">
            {reported.map(({ movieId, movieName, review }) => (
              <div key={review._id} className="bg-zinc-900 rounded-xl p-3">
                <div className="text-sm flex items-center justify-between">
                  <span>
                    <b>{movieName}</b> — {review.name} • ⭐ {review.rating} •{" "}
                    <span className="text-red-300">{(review.reports || []).length} report(s)</span>
                  </span>
                  <button
                    className="text-red-400 hover:underline"
                    onClick={() => handleDeleteComment(movieId, review._id)}
                  >
                    Delete review
                  </button>
                </div>
                <p className="text-sm opacity-80 mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Users</h2>
        {loadingUsers ? (
          <p>Loading users…</p>
        ) : users.length === 0 ? (
          <p className="opacity-70 text-sm">No users.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u._id} className="flex items-center justify-between bg-zinc-900 rounded-xl p-3">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs opacity-70">{u.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  {u.isAdmin && <span className="text-xs px-2 py-1 rounded-full border border-white/10">Admin</span>}
                  {u.isBlocked && <span className="text-xs px-2 py-1 rounded-full border border-red-400/30 text-red-300">Blocked</span>}
                  {!u.isAdmin && (
                    <button
                      onClick={() => toggleBlock(u)}
                      className="px-3 py-1 rounded-xl border border-white/10 hover:border-white/30"
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AllComments;
