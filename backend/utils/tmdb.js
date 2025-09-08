
const TMDB_API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

export async function tmdbSearch(title, year) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const url = new URL(`${TMDB_API}/search/movie`);
  url.searchParams.set("api_key", key);
  url.searchParams.set("query", title);
  if (year) url.searchParams.set("year", String(year));
  url.searchParams.set("include_adult", "false");
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] || null;
}

export async function tmdbDetails(id) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const url = new URL(`${TMDB_API}/movie/${id}`);
  url.searchParams.set("api_key", key);
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export async function tmdbCredits(id) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const url = new URL(`${TMDB_API}/movie/${id}/credits`);
  url.searchParams.set("api_key", key);
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export async function resolvePosterCast(title, year) {
  const hit = await tmdbSearch(title, year);
  if (!hit) return { image: "", cast: [], detail: "" };
  const details = await tmdbDetails(hit.id);
  const credits = await tmdbCredits(hit.id);
  const image = hit.poster_path ? `${IMG}${hit.poster_path}` : (details?.poster_path ? `${IMG}${details.poster_path}` : "");
  const cast = (credits?.cast || []).slice(0, 5).map(c => c.name).filter(Boolean);
  const detail = details?.overview || "";
  return { image, cast, detail };
}
