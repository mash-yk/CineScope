import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useGetProfileQuery, useProfileMutation } from "../../redux/api/users";
import { useFetchGenresQuery } from "../../redux/api/genre";
import { toast } from "react-toastify";

export default function Profile() {
  const { userInfo } = useSelector((s) => s.auth || {});
  const { data: profile, isLoading } = useGetProfileQuery(undefined, { skip: !userInfo });
  const [updateProfile, { isLoading: saving }] = useProfileMutation();
  const { data: allGenres = [] } = useFetchGenresQuery();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [favoriteGenres, setFavoriteGenres] = useState([]);

  useEffect(() => {
    if (profile) {
      setName(profile?.name || "");
      setEmail(profile?.email || "");
      setFavoriteGenres(profile?.favoriteGenres || []);
    }
  }, [profile]);

  if (!userInfo) return <div className="p-6">Please sign in to edit your profile.</div>;
  if (isLoading) return <div className="p-6">Loading…</div>;

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email, favoriteGenres }).unwrap();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Your Profile</h1>
      <form onSubmit={submitHandler} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Favorite genres</label>
          <div className="flex flex-wrap gap-2">
            {allGenres.map((g) => {
              const checked = favoriteGenres.includes(g);
              return (
                <label
                  key={g}
                  className={`text-sm px-3 py-1 rounded-full border cursor-pointer ${
                    checked ? "bg-white/10" : "bg-transparent"
                  } border-white/10`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={checked}
                    onChange={() =>
                      setFavoriteGenres((prev) => (checked ? prev.filter((x) => x !== g) : [...prev, g]))
                    }
                  />{" "}
                  {g}
                </label>
              );
            })}
          </div>
        </div>
        <button disabled={saving} className="rounded-xl border border-white/10 px-4 py-2">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
