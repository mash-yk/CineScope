import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import store from "./redux/store";
import "./index.css";

import App from "./App";
import Home from "./pages/Home";
import AllMovies from "./pages/Movies/AllMovies";
import MovieDetails from "./pages/Movies/MovieDetails";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/User/Dashboard";
import Profile from "./pages/User/Profile";
import AdminRoute from "./pages/Admin/AdminRoute";
import AdminMoviesList from "./pages/Admin/AdminMoviesList";
import AllComments from "./pages/Admin/AllComments";
import CreateMovie from "./pages/Admin/CreateMovie";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/movies", element: <AllMovies /> },
      { path: "/movies/:id", element: <MovieDetails /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/profile", element: <Profile /> },

      {
        path: "/admin/movies",
        element: (
          <AdminRoute>
            <AdminMoviesList />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/movies/comments",
        element: (
          <AdminRoute>
            <AllComments />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/movies/create",
        element: (
          <AdminRoute>
            <CreateMovie />
          </AdminRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
