import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/features/auth/authSlice";

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth || {});
  const isAdmin = !!userInfo?.isAdmin;

  const onLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const NavItem = ({ to, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1 rounded-2xl border transition ${
          isActive ? "border-white/40 bg-white/5" : "border-white/10 hover:border-white/30"
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <header className="w-full bg-black/70 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold">CineScope</Link>
        <nav className="flex items-center gap-2">
          <NavItem to="/movies">Movies</NavItem>
          {userInfo && <NavItem to="/dashboard">Dashboard</NavItem>}
          {userInfo && <NavItem to="/profile">Profile</NavItem>}
          {isAdmin && <NavItem to="/admin/movies">Admin</NavItem>}
          {!userInfo ? (
            <>
              <NavItem to="/login">Login</NavItem>
              <NavItem to="/register">Register</NavItem>
            </>
          ) : (
            <button onClick={onLogout} className="px-3 py-1 rounded-2xl border border-white/10 hover:border-white/30">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
