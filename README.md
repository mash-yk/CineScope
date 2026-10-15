# CineScope

A full-stack movie discovery and review platform built with the MERN stack. Users browse and filter movies, write reviews, vote on other people's reviews, keep a watchlist and get recommendations based on their favourite genres. Admins manage the catalogue and moderate reviews and users.

## Features

**For users**
- Browse all movies, or the top-rated, newest and random picks
- Filter by genre, year and minimum rating, and search by title
- Movie pages with poster, overview, cast, trailer link and average rating
- Write one review per movie (rating plus comment); ratings are recomputed on every review
- Upvote or downvote other reviews (one vote per user) and report abusive ones
- Watchlist saved to your account, shown on your dashboard
- Recommendations from your favourite genres, falling back to top-rated movies

**For admins**
- Add new movies and delete existing ones (the API also supports editing)
- See every reported review in one place and delete reviews
- Block or unblock review authors; blocked users cannot log in

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, Redux Toolkit (RTK Query), React Router, Tailwind CSS, Vite |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| Auth | JWT in an HTTP-only cookie, bcrypt password hashing |
| Data | TMDB API for posters, overviews, cast and trailers |

## API

Base URL: `http://localhost:3000/api/v1`. 24 endpoints in total.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/users` | Public | Register |
| POST | `/users/login` | Public | Log in (sets JWT cookie) |
| POST | `/users/logout` | Public | Log out |
| GET / PUT | `/users/profile` | User | View or update profile and favourite genres |
| POST | `/users/watchlist` | User | Add a movie to the watchlist |
| DELETE | `/users/watchlist/:movieId` | User | Remove a movie from the watchlist |
| GET | `/users/recommendations` | User | Movies from favourite genres |
| GET | `/users` | Admin | List users |
| PATCH | `/users/:id/block` | Admin | Block or unblock a user |
| GET | `/movies` | Public | List movies (`genre`, `year`, `minRating`, `q` filters) |
| GET | `/movies/top`, `/movies/new`, `/movies/random` | Public | Top-rated, newest and random movies |
| GET | `/movies/:id` | Public | Movie details with reviews |
| POST / PUT / DELETE | `/movies`, `/movies/:id` | Admin | Create, update, delete movies |
| POST | `/movies/:id/reviews` | User | Add a review |
| POST | `/movies/:id/reviews/:reviewId/like` | User | Upvote a review |
| POST | `/movies/:id/reviews/:reviewId/dislike` | User | Downvote a review |
| POST | `/movies/:id/reviews/:reviewId/report` | User | Report a review |
| DELETE | `/movies/:id/reviews/:reviewId` | Admin | Delete a review |
| GET | `/genres/genres` | Public | All genres in the catalogue |

## Getting started

**Requirements:** Node.js 18+, MongoDB running locally (or a MongoDB Atlas connection string), and a free [TMDB API key](https://www.themoviedb.org/settings/api) if you want real posters and cast.

```bash
git clone https://github.com/mash-yk/CineScope.git
cd CineScope
npm install
cd frontend && npm install && cd ..
```

Copy `.env.example` to `.env` in the project root and fill in your values.

Seed an admin account and the movie catalogue, then optionally pull posters, cast and trailers from TMDB:

```bash
node scripts/seedAdmin.js
node scripts/seedMovies.js
node scripts/enrichMoviesFromTMDB.js   # optional, needs TMDB_API_KEY
```

Run the backend and frontend together:

```bash
npm run fullstack
```

The app opens at `http://localhost:5173` and the API runs on `http://localhost:3000`.

## Project structure

```
backend/
  controllers/   request handlers for users, movies and genres
  middleware/    JWT authentication and admin check
  models/        Mongoose schemas (User, Movie with embedded reviews)
  routes/        Express routers
  utils/         JWT cookie helper, TMDB client
scripts/         seeding and TMDB enrichment scripts
frontend/src/
  pages/         Home, Movies, Auth, User dashboard and profile, Admin
  redux/         RTK Query API slices and app state
```

## Author

Mohammed Mashrekin Yakub · [GitHub](https://github.com/mash-yk) · [LinkedIn](https://www.linkedin.com/in/mohammed-mashrekin-yakub)
