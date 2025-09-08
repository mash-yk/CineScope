import { apiSlice } from './apiSlice';
const MOVIES_URL = '/movies';

export const moviesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---------- Queries ----------
    getMovies: builder.query({
      query: (params) => ({ url: `${MOVIES_URL}`, params }),
      providesTags: ['Movies'],
    }),

    getMovie: builder.query({
      query: (id) => `${MOVIES_URL}/${id}`,
      providesTags: ['Movies'],
    }),

    getTopMovies: builder.query({
      query: () => `${MOVIES_URL}/top`,
      providesTags: ['Movies'],
    }),

    getNewMovies: builder.query({
      query: () => `${MOVIES_URL}/new`,
      providesTags: ['Movies'],
    }),

    getRandomMovies: builder.query({
      query: () => `${MOVIES_URL}/random`,
      providesTags: ['Movies'],
    }),

    // ---------- Mutations ----------
    createMovie: builder.mutation({
      query: (body) => ({
        url: `${MOVIES_URL}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Movies'],
    }),

    updateMovie: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `${MOVIES_URL}/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Movies'],
    }),

    // Admin: delete a movie
    deleteMovie: builder.mutation({
      query: (id) => ({
        url: `${MOVIES_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Movies'],
    }),

    // User: add / react to reviews
    addReview: builder.mutation({
      query: ({ id, rating, comment }) => ({
        url: `${MOVIES_URL}/${id}/reviews`,
        method: 'POST',
        body: { rating, comment },
      }),
      invalidatesTags: ['Movies'],
    }),

    likeReview: builder.mutation({
      query: ({ id, reviewId }) => ({
        url: `${MOVIES_URL}/${id}/reviews/${reviewId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Movies'],
    }),

    dislikeReview: builder.mutation({
      query: ({ id, reviewId }) => ({
        url: `${MOVIES_URL}/${id}/reviews/${reviewId}/dislike`,
        method: 'POST',
      }),
      invalidatesTags: ['Movies'],
    }),

    reportReview: builder.mutation({
      query: ({ id, reviewId, reason }) => ({
        url: `${MOVIES_URL}/${id}/reviews/${reviewId}/report`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Movies'],
    }),

    // Admin: delete a specific review
    deleteComment: builder.mutation({
      query: ({ movieId, reviewId }) => ({
        url: `${MOVIES_URL}/${movieId}/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Movies'],
    }),
  }),
});

export const {
  useGetMoviesQuery,
  useGetMovieQuery,
  useGetTopMoviesQuery,
  useGetNewMoviesQuery,
  useGetRandomMoviesQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useAddReviewMutation,
  useLikeReviewMutation,
  useDislikeReviewMutation,
  useReportReviewMutation,
  useDeleteCommentMutation,
} = moviesApiSlice;

// ---- Compatibility exports (aliases) ----

// list variants
export const useGetAllMoviesQuery = useGetMoviesQuery;
export const useFetchMoviesQuery = useGetMoviesQuery;

// collections
export const useTopMoviesQuery           = useGetTopMoviesQuery;
export const useGetTopRatedMoviesQuery   = useGetTopMoviesQuery;
export const useGetNewlyAddedMoviesQuery = useGetNewMoviesQuery;

// details
export const useGetSpecificMovieQuery = useGetMovieQuery;
export const useGetMovieDetailsQuery  = useGetMovieQuery;
export const useGetSingleMovieQuery   = useGetMovieQuery;
export const useFetchMovieQuery       = useGetMovieQuery;
export const useMovieQuery            = useGetMovieQuery;
export const useGetMovieByIdQuery     = useGetMovieQuery;

// movie mutations
export const useAddMovieMutation            = useCreateMovieMutation;
export const useEditMovieMutation           = useUpdateMovieMutation;
export const useUpdateMovieDetailsMutation  = useUpdateMovieMutation;

// keep older components (that call `useAddMovieReviewMutation` or `useDeleteReviewMutation`) working
export const useAddMovieReviewMutation = useAddReviewMutation;
export const useDeleteReviewMutation   = useDeleteCommentMutation;
