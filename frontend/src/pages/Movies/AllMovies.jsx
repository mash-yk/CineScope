import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetAllMoviesQuery,
  useGetNewMoviesQuery,
  useGetTopMoviesQuery,
  useGetRandomMoviesQuery,
} from "../../redux/api/movies";
import { useFetchGenresQuery } from "../../redux/api/genre";
import { setMoviesFilter } from "../../redux/features/movies/moviesSlice";
import MovieCard from "../../component/MovieCard";

const AllMovies = () => {
  const dispatch = useDispatch();
  const { moviesFilter } = useSelector((s) => s.movies);

  const [q, setQ] = useState("");
  const [minRating, setMinRating] = useState(0);

  // fetch lists
  const { data: all = [] } = useGetAllMoviesQuery({});
  const { data: top = [] } = useGetTopMoviesQuery();
  const { data: recent = [] } = useGetNewMoviesQuery();
  const { data: random = [] } = useGetRandomMoviesQuery();
  const { data: genres = [] } = useFetchGenresQuery();

  // pick a base list by "source"
  const base = useMemo(() => {
    switch (moviesFilter?.source) {
      case "top":
        return top;
      case "new":
        return recent;
      case "random":
        return random;
      default:
        return all;
    }
  }, [moviesFilter?.source, all, top, recent, random]);

  // apply filters client-side (works for any source)
  const dataset = useMemo(() => {
    return base
      .filter((m) => (moviesFilter?.genre ? m.genres?.includes(moviesFilter.genre) : true))
      .filter((m) => (moviesFilter?.year ? String(m.year) === String(moviesFilter.year) : true))
      .filter((m) => (minRating ? (m.avgRating ?? 0) >= minRating : true))
      .filter((m) => (q ? m.name?.toLowerCase().includes(q.toLowerCase()) : true));
  }, [base, moviesFilter?.genre, moviesFilter?.year, minRating, q]);

  const years = useMemo(() => {
    const ys = [...new Set(all.map((m) => m?.year).filter(Boolean))].sort((a, b) => b - a);
    return ys;
  }, [all]);

  useEffect(() => {
    if (!moviesFilter) dispatch(setMoviesFilter({ source: "all", genre: "", year: "" }));
  }, [moviesFilter, dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">All Movies</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <select
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
          value={moviesFilter?.source || "all"}
          onChange={(e) => dispatch(setMoviesFilter({ source: e.target.value }))}
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="top">Top rated</option>
          <option value="random">Random</option>
        </select>

        <select
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
          value={moviesFilter?.genre || ""}
          onChange={(e) => dispatch(setMoviesFilter({ genre: e.target.value }))}
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
          value={moviesFilter?.year || ""}
          onChange={(e) => dispatch(setMoviesFilter({ year: e.target.value }))}
        >
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title…"
          className="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
        />

        <label className="text-sm">
          Min rating
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="ml-2 align-middle"
          />
          <span className="ml-1 opacity-80">{minRating}</span>
        </label>
      </div>

      {/* Grid */}
      {dataset.length === 0 ? (
        <p className="opacity-80">No movies found.</p>
      ) : (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {dataset.map((m) => (
            <MovieCard key={m._id} movie={m} />
          ))}
        </section>
      )}
    </div>
  );
};

export default AllMovies;
