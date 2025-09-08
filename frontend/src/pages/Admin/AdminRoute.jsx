import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({ children }) {
  const { userInfo } = useSelector((s) => s.auth || {});
  const loc = useLocation();

  if (!userInfo) return <Navigate to={`/login?redirect=${encodeURIComponent(loc.pathname)}`} replace />;
  if (!userInfo.isAdmin) return <Navigate to="/" replace />;

  return children;
}
