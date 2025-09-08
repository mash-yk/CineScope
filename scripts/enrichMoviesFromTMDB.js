import 'dotenv/config';
import axios from 'axios';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cineScope';
const TMDB_KEY  = process.env.TMDB_API_KEY;
const OMDB_KEY  = process.env.OMDB_API_KEY;
const FORCE     = process.argv.includes('--force');

if (!TMDB_KEY) {
  console.error('❌ Missing TMDB_API_KEY in .env');
  process.exit(1);
}

const movieSchema = new mongoose.Schema({
  name: String,
  year: Number,
  image: String,
  trailerUrl: String,
  detail: String,
  cast: [String],
  reviews: Array,
  avgRating: Number,
  numReviews: Number,
}, { timestamps: true });

movieSchema.methods.recomputeRating = function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.avgRating = 0; this.numReviews = 0; return;
  }
  const sum = this.reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  this.numReviews = this.reviews.length;
  this.avgRating = Math.round((sum / this.reviews.length) * 10) / 10;
};

const Movie = mongoose.model('Movie', movieSchema, 'movies');

// --- Helpers ---
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function tmdbSearch(title, year) {
  const url = 'https://api.themoviedb.org/3/search/movie';
  const { data } = await axios.get(url, {
    params: { api_key: TMDB_KEY, query: title, year, include_adult: false, language: 'en-US' },
    timeout: 15000,
  });
  return data?.results?.[0] || null;
}

async function tmdbDetails(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}`;
  const { data } = await axios.get(url, {
    params: { api_key: TMDB_KEY, append_to_response: 'videos,credits' },
    timeout: 15000,
  });
  return data;
}

async function omdbByTitle(title, year) {
  if (!OMDB_KEY) return null;
  const { data } = await axios.get('https://www.omdbapi.com/', {
    params: { apikey: OMDB_KEY, t: title, y: year, plot: 'full' },
    timeout: 15000,
  });
  return data?.Response === 'True' ? data : null;
}

function bestYoutubeTrailer(videos = {}) {
  const list = videos.results || [];
  const official = list.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
  const any = official || list.find(v => v.site === 'YouTube' && v.type === 'Trailer') || null;
  return any ? `https://www.youtube.com/watch?v=${any.key}` : '';
}

function castTop(credits = {}, limit = 10) {
  const cast = credits.cast || [];
  return cast.slice(0, limit).map(c => c.name).filter(Boolean);
}

function tmdbPosterToUrl(path) {
  return path ? `https://image.tmdb.org/t/p/w780${path}` : '';
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to Mongo');

  const movies = await Movie.find({}).sort({ createdAt: 1 });
  console.log(`Found ${movies.length} movie(s)`);

  let updated = 0, skipped = 0, failed = 0;

  for (const m of movies) {
    try {
      const needImage   = FORCE || !m.image;
      const needDetail  = FORCE || !m.detail;
      const needTrailer = FORCE || !m.trailerUrl;
      const needCast    = FORCE || !m.cast || m.cast.length === 0;

      if (!needImage && !needDetail && !needTrailer && !needCast) {
        skipped++;
        continue;
      }

      const found = await tmdbSearch(m.name, m.year);
      if (!found) {
        console.warn(`⚠️  TMDB not found for "${m.name}" (${m.year || ''})`);
      }

      let details = null;
      if (found) {
        details = await tmdbDetails(found.id);
        await sleep(250);
      }
      const fromTMDB = {
        image:      details ? tmdbPosterToUrl(details.poster_path) : '',
        detail:     details?.overview || '',
        trailerUrl: details ? bestYoutubeTrailer(details.videos) : '',
        cast:       details ? castTop(details.credits, 10) : [],
      };

      let fromOMDb = { image: '', detail: '' };
      if ((!fromTMDB.detail || !fromTMDB.image) && OMDB_KEY) {
        const om = await omdbByTitle(m.name, m.year);
        if (om) {
          fromOMDb = {
            image: om.Poster && om.Poster !== 'N/A' ? om.Poster : '',
            detail: om.Plot && om.Plot !== 'N/A' ? om.Plot : '',
          };
        }
      }

      const before = { image: m.image, detail: m.detail, trailerUrl: m.trailerUrl, cast: m.cast };

      m.image      = needImage   ? (fromTMDB.image      || fromOMDb.image   || m.image || '')      : m.image;
      m.detail     = needDetail  ? (fromTMDB.detail     || fromOMDb.detail  || m.detail || '')     : m.detail;
      m.trailerUrl = needTrailer ? (fromTMDB.trailerUrl || m.trailerUrl || '')                      : m.trailerUrl;
      m.cast       = needCast    ? (fromTMDB.cast?.length ? fromTMDB.cast : (m.cast || []))        : m.cast;

      const changed =
        m.image !== before.image ||
        m.detail !== before.detail ||
        m.trailerUrl !== before.trailerUrl ||
        JSON.stringify(m.cast || []) !== JSON.stringify(before.cast || []);

      if (changed) {
        await m.save();
        updated++;
        console.log(`✅ Updated: ${m.name} (${m.year || ''})`);
      } else {
        skipped++;
      }
    } catch (e) {
      failed++;
      console.error(`❌ Failed on "${m.name}":`, e?.response?.data || e.message);
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
