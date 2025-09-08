import { apiSlice } from './apiSlice';
const USERS_URL = '/users';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Auth ---
    login: builder.mutation({
      query: (body) => ({ url: `${USERS_URL}/login`, method: 'POST', body }),
      invalidatesTags: ['Users'],
    }),
    register: builder.mutation({
      query: (body) => ({ url: `${USERS_URL}`, method: 'POST', body }),
      invalidatesTags: ['Users'],
    }),
    logout: builder.mutation({
      query: () => ({ url: `${USERS_URL}/logout`, method: 'POST' }),
      invalidatesTags: ['Users'],
    }),

    // --- Profile ---
    getProfile: builder.query({
      query: () => ({ url: `${USERS_URL}/profile`, method: 'GET' }),
      providesTags: ['Users'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: `${USERS_URL}/profile`, method: 'PUT', body }),
      invalidatesTags: ['Users'],
    }),

    // --- Watchlist ---
    addToWatchlist: builder.mutation({
      query: (movieId) => ({ url: `${USERS_URL}/watchlist`, method: 'POST', body: { movieId } }),
      invalidatesTags: ['Users'],
    }),
    removeFromWatchlist: builder.mutation({
      query: (movieId) => ({ url: `${USERS_URL}/watchlist/${movieId}`, method: 'DELETE' }),
      invalidatesTags: ['Users'],
    }),

    // --- Admin ---
    getUsers: builder.query({
      query: () => `${USERS_URL}`,
      providesTags: ['Users'],
    }),

    // make this flexible so UI can call with either shape:
    //   { id, isBlocked }  OR  { userId, blocked }
    blockUser: builder.mutation({
      query: (args = {}) => {
        const userId   = args.userId ?? args.id;
        const blocked  = args.blocked ?? args.isBlocked ?? true;
        return {
          url: `${USERS_URL}/${userId}/block`,
          method: 'PATCH',
          body: { isBlocked: blocked },
        };
      },
      invalidatesTags: ['Users'],
    }),

    // --- Recommendations ---
    getRecommendations: builder.query({
      query: () => ({ url: `${USERS_URL}/recommendations`, method: 'GET' }),
      providesTags: ['Users'],
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
  useGetUsersQuery,
  useBlockUserMutation,        // now flexible: accepts { id, isBlocked } OR { userId, blocked }
  useGetRecommendationsQuery,
} = usersApiSlice;

/* ---------------- Legacy aliases so older components still work ---------------- */
// auth
export const useLoginUserMutation    = useLoginMutation;
export const useRegisterUserMutation = useRegisterMutation;
export const useSignupMutation       = useRegisterMutation;
export const useLogoutUserMutation   = useLogoutMutation;

// profile
export const useProfileQuery           = useGetProfileQuery;
export const useGetUserProfileQuery    = useGetProfileQuery;
export const useCurrentUserQuery       = useGetProfileQuery;
export const useMeQuery                = useGetProfileQuery;

export const useProfileMutation            = useUpdateProfileMutation;
export const useUpdateUserProfileMutation  = useUpdateProfileMutation;
export const useUpdateMeMutation           = useUpdateProfileMutation;

// watchlist
export const useAddWatchlistMutation    = useAddToWatchlistMutation;
export const useRemoveWatchlistMutation = useRemoveFromWatchlistMutation;

// users list (admin)
export const useFetchUsersQuery   = useGetUsersQuery;
export const useGetAllUsersQuery  = useGetUsersQuery;

// recommendations
export const useGetUserRecommendationsQuery = useGetRecommendationsQuery;
