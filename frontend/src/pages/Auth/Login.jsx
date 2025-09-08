import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loader from "../../component/Loader";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { useLoginMutation } from "../../redux/api/users";
import hero from "../../assets/banner.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();
  const redirect = new URLSearchParams(search).get("redirect") || "/";

  const { userInfo } = useSelector((s) => s.auth);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setCredentials(data));
      toast.success("Signed in");
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative min-h-[60vh]">
      <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="relative max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-6">Sign in</h1>
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button disabled={isLoading} className="w-full rounded-xl border border-white/10 py-2">
            {isLoading ? <Loader /> : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-sm opacity-80">
          New here?{" "}
          <Link className="underline" to={redirect ? `/register?redirect=${redirect}` : "/register"}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
