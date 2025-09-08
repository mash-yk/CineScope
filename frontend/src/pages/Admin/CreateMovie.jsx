import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCreateMovieMutation } from "../../redux/api/movies";

const CreateMovie = () => {
  const [form, setForm] = useState({
    name: "",
    year: "",
    image: "",
    trailerUrl: "",
    detail: "",
    genres: "",
    cast: "",
  });
  const [createMovie, { isLoading }] = useCreateMovieMutation();
  const navigate = useNavigate();

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name.trim(),
        year: form.year ? Number(form.year) : undefined,
        image: form.image.trim(),
        trailerUrl: form.trailerUrl.trim(),
        detail: form.detail.trim(),
        genres: form.genres.split(",").map((x) => x.trim()).filter(Boolean),
        cast: form.cast.split(",").map((x) => x.trim()).filter(Boolean),
      };
      await createMovie(payload).unwrap();
      toast.success("Movie created");
      navigate("/admin/movies");
    } catch (err) {
      toast.error(err?.data?.message || "Create failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Create Movie</h1>
      <form onSubmit={submit} className="space-y-4">
        {["name", "year", "image", "trailerUrl", "detail", "genres", "cast"].map((k) => (
          <div key={k}>
            <label className="block text-sm mb-1 capitalize">{k}</label>
            <input
              name={k}
              value={form[k]}
              onChange={onChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
            />
          </div>
        ))}
        <button disabled={isLoading} className="rounded-xl border border-white/10 px-4 py-2">
          {isLoading ? "Saving…" : "Create"}
        </button>
      </form>
    </div>
  );
};

export default CreateMovie;
