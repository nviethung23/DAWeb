import React, { useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { darkSelectStyles } from "../layouts/darkSelectStyles"; // Đã tối ưu sẵn

const TMDB_API_KEY = "beede3bb5fc88310916252b96f99062a";
const API_BASE = "http://localhost:5000/api";

const countryOptions = [
  { value: "US", label: "United States" },
  { value: "VN", label: "Vietnam" },
  { value: "KR", label: "South Korea" },
  { value: "JP", label: "Japan" },
  { value: "CN", label: "China" },
  { value: "FR", label: "France" },
  { value: "RU", label: "Russia" },
  { value: "IN", label: "India" },
  { value: "GB", label: "United Kingdom" },
  { value: "TH", label: "Thailand" },
  { value: "DE", label: "Germany" },
  { value: "IT", label: "Italy" },
  { value: "CA", label: "Canada" },
  { value: "ES", label: "Spain" },
  { value: "AU", label: "Australia" },
  { value: "ID", label: "Indonesia" },
];

async function fetchGenres() {
  const res = await axios.get(
    `https://api.themoviedb.org/3/genre/movie/list`,
    { params: { api_key: TMDB_API_KEY, language: "en-US" } }
  );
  return (res.data.genres || []).map((g) => ({
    value: g.name,
    label: g.name,
  }));
}

function loadActorOptions(inputValue, callback) {
  if (!inputValue) {
    callback([]);
    return;
  }
  axios
    .get(`https://api.themoviedb.org/3/search/person`, {
      params: { api_key: TMDB_API_KEY, query: inputValue, page: 1 },
    })
    .then((res) => {
      const options = (res.data.results || []).map((actor) => ({
        label: actor.name,
        value: actor.id,
      }));
      callback(options);
    })
    .catch(() => callback([]));
}

export default function AdminMovies() {
  const { user } = useAuth();
  const token = user?.token;
  const [movies, setMovies] = useState([]);
  const [genresOptions, setGenresOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editMovie, setEditMovie] = useState(null);
  const [formData, setFormData] = useState(null);

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);
  const [movieType, setMovieType] = useState("single");

  // Đặt background đen cho toàn trang
  useEffect(() => {
    document.body.style.background = "#0a0a0f";
    fetchMovies();
    fetchGenres().then(setGenresOptions);
    return () => {
      document.body.style.background = "";
    };
    // eslint-disable-next-line
  }, []);

  async function fetchMovies() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/movies`);
      setMovies(res.data.movies || []);
    } catch {
      alert("Lỗi tải phim");
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditMovie(null);
    setFormData({
      title: "",
      description: "",
      year: "",
      trailer: "",
      poster: null,
      video: null,
      trailer_file: null,
      gallery: [],
    });
    setSelectedCountries([]);
    setSelectedGenres([]);
    setSelectedActors([]);
    setMovieType("single");
  }

  function openEditForm(movie) {
    setEditMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      year: movie.year,
      trailer: movie.trailer || "",
      poster: null,
      video: null,
      trailer_file: null,
      gallery: [],
    });
    // Fix country nhận lại array/string
    setSelectedCountries(
      typeof movie.country === "string"
        ? movie.country.split(",").map(code => countryOptions.find(c => c.value === code.trim()) || { value: code.trim(), label: code.trim() })
        : Array.isArray(movie.country)
        ? movie.country.map(code => countryOptions.find(c => c.value === code) || { value: code, label: code })
        : []
    );
    setSelectedGenres(
      typeof movie.genre === "string"
        ? movie.genre.split(",").map(name => genresOptions.find(g => g.value === name.trim()) || { value: name.trim(), label: name.trim() })
        : Array.isArray(movie.genre)
        ? movie.genre.map(name => genresOptions.find(g => g.value === name) || { value: name, label: name })
        : []
    );
    setSelectedActors(actorOptionsFromString(movie.actors, selectedActors));
    setMovieType(movie.type || "single");
  }

  function actorOptionsFromString(actorsStr = "", currentOptions = []) {
    if (!actorsStr) return [];
    const names = actorsStr.split(",").map((s) => s.trim());
    return names.map((name) => {
      const found = currentOptions.find((a) => a.label === name);
      return found || { label: name, value: name };
    });
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      if (name === "gallery") {
        setFormData((prev) => ({ ...prev, gallery: files }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: files[0] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      alert("Bạn chưa đăng nhập admin");
      return;
    }
    const form = new FormData();
    form.append("country", selectedCountries.map((c) => c.value).join(","));
    form.append("genre", selectedGenres.map((g) => g.value).join(","));
    form.append(
      "actors",
      selectedActors.length > 0
        ? selectedActors.map((a) => a.label).join(", ")
        : ""
    );
    form.append("type", movieType);

    for (const key in formData) {
      if (formData[key]) {
        if (key === "gallery") {
          for (let i = 0; i < formData.gallery.length; i++) {
            form.append("gallery", formData.gallery[i]);
          }
        } else {
          form.append(key, formData[key]);
        }
      }
    }

    try {
      setLoading(true);
      let res;
      if (editMovie) {
        res = await axios.put(`${API_BASE}/movies/${editMovie.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await axios.post(`${API_BASE}/movies`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      alert(res.data.message || "Thành công");
      fetchMovies();
      setEditMovie(null);
      setFormData(null);
      setSelectedCountries([]);
      setSelectedGenres([]);
      setSelectedActors([]);
      setMovieType("single");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!token) {
      alert("Bạn chưa đăng nhập admin");
      return;
    }
    if (!window.confirm("Bạn chắc chắn muốn xóa phim này?")) return;
    try {
      setLoading(true);
      const res = await axios.delete(`${API_BASE}/movies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message || "Xóa thành công");
      fetchMovies();
    } catch {
      alert("Lỗi xóa phim");
    } finally {
      setLoading(false);
    }
  }

  function getPosterUrl(m) {
    if (m.poster && typeof m.poster === "string" && m.poster.startsWith("http")) return m.poster;
    if (m.poster && typeof m.poster === "string" && m.poster.startsWith("/uploads")) return "http://localhost:5000" + m.poster;
    if (m.poster && m.poster.length > 2 && m.poster.indexOf("/") > -1) return m.poster;
    return "/no-image.png";
  }

  return (
    <div className="pt-32 min-h-screen w-full px-0 md:px-4 bg-[#0a0a0f] text-white">
      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#181825] px-12 py-8 rounded-2xl shadow-2xl text-lg font-semibold text-yellow-400 flex items-center gap-2">
            <svg className="animate-spin w-7 h-7 mr-3 text-yellow-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg>
            Đang xử lý...
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-yellow-400 tracking-wide text-center">Quản lý phim</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-7 gap-3">
          <button
            onClick={openAddForm}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-6 py-2 rounded-xl shadow-xl transition flex items-center gap-2"
          >
            <span>+ Thêm phim mới</span>
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl shadow-2xl border border-[#222229] mb-10 bg-[#17171f]/90 backdrop-blur">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-[#191920] text-yellow-400">
                <th className="p-3 border border-[#232332]">Poster</th>
                <th className="p-3 border border-[#232332]">ID</th>
                <th className="p-3 border border-[#232332]">Tiêu đề</th>
                <th className="p-3 border border-[#232332]">Năm</th>
                <th className="p-3 border border-[#232332]">Quốc gia</th>
                <th className="p-3 border border-[#232332]">Thể loại</th>
                <th className="p-3 border border-[#232332]">Loại</th>
                <th className="p-3 border border-[#232332]">Diễn viên</th>
                <th className="p-3 border border-[#232332]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m.id} className="border-b border-[#232332] hover:bg-[#22222a]/80 transition group">
                  <td className="p-2 border border-[#232332]">
                    <img
                      src={getPosterUrl(m)}
                      alt={m.title}
                      className="w-16 h-24 object-cover rounded-2xl shadow group-hover:ring-2 ring-yellow-400 transition"
                      loading="lazy"
                    />
                  </td>
                  <td className="p-2 border border-[#232332]">{m.id}</td>
                  <td className="p-2 border border-[#232332] font-bold">{m.title}</td>
                  <td className="p-2 border border-[#232332]">{m.year}</td>
                  <td className="p-2 border border-[#232332]">
                    {Array.isArray(m.country) ? m.country.join(", ") : m.country}
                  </td>
                  <td className="p-2 border border-[#232332]">
                    {Array.isArray(m.genre) ? m.genre.join(", ") : m.genre}
                  </td>
                  <td className="p-2 border border-[#232332]">
                    <span className={`font-semibold px-2 py-1 rounded-lg ${m.type === "series"
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-pink-900/60 text-pink-200"
                      }`}>
                      {m.type === "series" ? "Phim bộ" : "Phim lẻ"}
                    </span>
                  </td>
                  <td className="p-2 border border-[#232332] text-gray-200">{m.actors}</td>
                  <td className="p-2 border border-[#232332] whitespace-nowrap space-x-2">
                    <button
                      onClick={() => openEditForm(m)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-1 rounded-xl shadow"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold px-4 py-1 rounded-xl shadow"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(editMovie !== null || formData) && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl bg-[#191a21] border border-[#23252d] space-y-6 p-8 relative"
              style={{ minWidth: 340 }}
            >
              <button
                type="button"
                onClick={() => {
                  setEditMovie(null);
                  setFormData(null);
                  setSelectedCountries([]);
                  setSelectedGenres([]);
                  setSelectedActors([]);
                  setMovieType("single");
                }}
                className="absolute top-4 right-6 text-gray-400 hover:text-red-400 text-2xl font-bold focus:outline-none"
                aria-label="Đóng"
                title="Đóng"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
                {editMovie ? "Sửa phim" : "Thêm phim mới"}
              </h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center w-full md:w-56">
                  {/* Show poster preview nếu có */}
                  {(editMovie && getPosterUrl(editMovie) !== "/no-image.png") && (
                    <img
                      src={getPosterUrl(editMovie)}
                      alt="Poster"
                      className="w-40 h-56 object-cover rounded-xl mb-4 border border-gray-400 shadow-xl"
                    />
                  )}
                  <label className="w-full font-medium text-sm text-gray-200">
                    Poster mới:
                    <input
                      name="poster"
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className="block mt-1"
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-4">
                  <input
                    name="title"
                    placeholder="Tiêu đề"
                    value={formData?.title || ""}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-xl bg-[#23232a] text-white"
                  />
                  <textarea
                    name="description"
                    placeholder="Mô tả"
                    value={formData?.description || ""}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-xl bg-[#23232a] text-white"
                    rows={3}
                  />
                  <input
                    name="year"
                    type="number"
                    placeholder="Năm"
                    value={formData?.year || ""}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded-xl bg-[#23232a] text-white"
                  />
                  <div>
                    <label className="block font-medium mb-1 text-gray-300">Loại phim</label>
                    <Select
                      styles={darkSelectStyles}
                      options={[
                        { value: "single", label: "Phim lẻ" },
                        { value: "series", label: "Phim bộ" },
                      ]}
                      value={
                        movieType === "series"
                          ? { value: "series", label: "Phim bộ" }
                          : { value: "single", label: "Phim lẻ" }
                      }
                      onChange={(option) => setMovieType(option.value)}
                      isSearchable={false}
                      className="w-48"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-300">Quốc gia</label>
                    <Select
                      styles={darkSelectStyles}
                      options={countryOptions}
                      value={selectedCountries}
                      onChange={setSelectedCountries}
                      isMulti
                      placeholder="Chọn một hoặc nhiều quốc gia"
                      isClearable
                      isSearchable
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-300">Thể loại</label>
                    <Select
                      styles={darkSelectStyles}
                      options={genresOptions}
                      value={selectedGenres}
                      onChange={setSelectedGenres}
                      isMulti
                      placeholder="Chọn một hoặc nhiều thể loại"
                      isClearable
                      isSearchable
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-300">Diễn viên</label>
                    <AsyncSelect
                      styles={darkSelectStyles}
                      cacheOptions
                      loadOptions={loadActorOptions}
                      defaultOptions
                      isMulti
                      value={selectedActors}
                      onChange={setSelectedActors}
                      placeholder="Tìm và chọn diễn viên"
                      noOptionsMessage={() => "Không tìm thấy diễn viên"}
                      className="w-full"
                    />
                  </div>
                  <input
                    name="trailer"
                    placeholder="Link trailer"
                    value={formData?.trailer || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-xl bg-[#23232a] text-white"
                  />
                  <label className="block text-gray-200">
                    Video phim:
                    <input
                      name="video"
                      type="file"
                      accept="video/*"
                      onChange={handleChange}
                      className="block mt-1"
                    />
                  </label>
                  <label className="block text-gray-200">
                    Trailer file:
                    <input
                      name="trailer_file"
                      type="file"
                      accept="video/*"
                      onChange={handleChange}
                      className="block mt-1"
                    />
                  </label>
                  <label className="block text-gray-200">
                    Gallery (nhiều ảnh):
                    <input
                      name="gallery"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleChange}
                      className="block mt-1"
                    />
                  </label>
                  <div className="flex gap-4 mt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl shadow-xl"
                    >
                      {loading ? "Đang gửi..." : editMovie ? "Cập nhật" : "Thêm mới"}
                    </button>
                    {editMovie && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditMovie(null);
                          setFormData(null);
                          setSelectedCountries([]);
                          setSelectedGenres([]);
                          setSelectedActors([]);
                          setMovieType("single");
                        }}
                        className="bg-gray-400 hover:bg-gray-500 text-black px-6 py-2 rounded-xl shadow"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
