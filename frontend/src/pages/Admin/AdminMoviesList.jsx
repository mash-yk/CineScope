import { Link } from "react-router-dom";
import { useGetAllMoviesQuery, useDeleteMovieMutation } from "../../redux/api/movies";
import { toast } from "react-toastify";

const AdminMoviesList = () => {
  const { data: movies = [], refetch, isFetching } = useGetAllMoviesQuery();
  const [deleteMovie] = useDeleteMovieMutation();

  const onDelete = async (id) => {
    try {
      await deleteMovie(id).unwrap();
      toast.success("Movie removed");
      refetch();
    } catch (e) {
      toast.error(e?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <div className="flex gap-2">
          <Link to="/admin/movies/comments" className="px-3 py-1 rounded-xl border border-white/10">Moderation</Link>
          <Link to="/admin/movies/create" className="px-3 py-1 rounded-xl border border-white/10">Add Movie</Link>
        </div>
      </div>
      {isFetching ? (
        <p>Loading…</p>
      ) : (
        <div className="space-y-2">
          {movies.map((m) => (
            <div key={m._id} className="flex items-center justify-between bg-zinc-900 rounded-xl p-3">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs opacity-70">⭐ {m.avgRating ?? 0} • {m.year ?? "—"}</div>
              </div>
              <div className="flex gap-2">
                <Link to={`/movies/${m._id}`} className="px-3 py-1 rounded-xl border border-white/10">View</Link>
                <button onClick={() => onDelete(m._id)} className="px-3 py-1 rounded-xl border border-red-500/40 text-red-300">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMoviesList;
