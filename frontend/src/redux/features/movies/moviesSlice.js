import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  watchlist: [],
  moviesFilter: { source: "all", genre: "", year: "" }, // all | new | top | random
  filteredMovies: [],
  movieYears: [],
  uniqueYears: [],
};

const moviesSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    addToWatchlist: (state, action) => {
      if (!state.watchlist.find((m) => m._id === action.payload._id)) {
        state.watchlist.push(action.payload);
      }
    },
    removeFromWatchlist: (state, action) => {
      state.watchlist = state.watchlist.filter((m) => m._id !== action.payload);
    },

    // Filters
    setMoviesFilter: (state, action) => {
      state.moviesFilter = { ...state.moviesFilter, ...action.payload };
    },
    setFilteredMovies: (state, action) => {
      state.filteredMovies = action.payload || [];
    },
    setMovieYears: (state, action) => {
      state.movieYears = action.payload || [];
    },
    setUniqueYears: (state, action) => {
      const arr = Array.isArray(action.payload) ? action.payload : [];
      state.uniqueYears = [...new Set(arr.filter(Boolean))].sort();
    },
    clearFilters: (state) => {
      state.moviesFilter = { source: "all", genre: "", year: "" };
      state.filteredMovies = [];
    },
  },
});

export const {
  addToWatchlist,
  removeFromWatchlist,
  setMoviesFilter,
  setFilteredMovies,
  setMovieYears,
  setUniqueYears,
  clearFilters,
} = moviesSlice.actions;

export default moviesSlice.reducer;
