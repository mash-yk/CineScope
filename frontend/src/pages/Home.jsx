import banner from "../assets/banner.jpg";
import { useGetAllMoviesQuery } from "../redux/api/movies";
import MovieCard from "../component/MovieCard";

const Home = () => {
  const { data: allMovies = [], isLoading, isError, error } = useGetAllMoviesQuery();
  const top = allMovies.slice(0, 12);

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-red-400">Failed to load movies: {error?.data?.message || error?.error || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative h-[40vh] md:h-[50vh]">
        <img src={banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black" />
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-end pb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Welcome to CineScope</h1>
            <p className="opacity-80 max-w-2xl">Discover, track, and review your favorite films. Browse by category, rating, and more.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold mb-4">Popular now</h2>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 bg-zinc-900/70 border border-zinc-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {top.map((m) => (
              <MovieCard key={m._id} movie={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;