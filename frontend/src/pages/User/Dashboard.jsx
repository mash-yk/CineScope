
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useGetRecommendationsQuery } from "../../redux/api/users";

const Grid = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{children}</div>
);

const MovieTile = ({ m }) => {
  const poster = m?.image && /^https?:\/\//i.test(m.image)
    ? m.image
    : `https://dummyimage.com/600x900/222/fff.jpg&text=${encodeURIComponent(m?.name || "Poster")}`;
  return (
    <Link to={`/movies/${m._id}`} className="block">
      <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: "2/3" }}>
        <img src={poster} alt={m?.name} className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="mt-2 text-sm truncate">{m?.name}</div>
    </Link>
  );
};

const Dashboard = () => {
  const { userInfo } = useSelector((s) => s.auth);
  const { data: recs } = useGetRecommendationsQuery(undefined, { skip: !userInfo });

  const [watchlist, setWatchlist] = useState([]);
  useEffect(() => {
    if (userInfo?.watchlist) setWatchlist(userInfo.watchlist);
  }, [userInfo]);

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

      {watchlist?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Watchlist</h2>
          <Grid>
            {watchlist.map((m) => <MovieTile key={m._id || m} m={m} />)}
          </Grid>
        </section>
      )}

      {recs?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Recommended for you</h2>
          <Grid>
            {recs.map((m) => <MovieTile key={m._id} m={m} />)}
          </Grid>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
