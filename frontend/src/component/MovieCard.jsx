import { Link } from "react-router-dom";

const FALLBACK_POSTER =
  "https://via.placeholder.com/600x900/1f1f1f/ffffff?text=No+Poster";

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie._id}`} className="group block">
      <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
        <img
          src={movie.image || FALLBACK_POSTER}
          alt={movie.name}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover group-hover:opacity-90 transition"
        />
      </div>
      <div className="mt-2">
        <div className="font-medium leading-tight">{movie.name}</div>
        <div className="text-sm opacity-70">{movie.year || ""}</div>
      </div>
    </Link>
  );
}
