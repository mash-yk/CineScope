import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    // point the frontend to the running backend in dev
    baseUrl: 'http://localhost:3000/api/v1',
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Movies', 'Users', 'Genres'],
  endpoints: () => ({}),
});
