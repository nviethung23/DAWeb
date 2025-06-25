import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [token] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    year: "",
    country: "",
    genre: "",
    actors: "",
    trailer: "",
    poster: null,
    video: null,
    trailer_file: null,
    gallery: []
  });

  useEffect(() => {
    fetchMovies();
    fetchGenres();
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

  async function fetchGenres() {
    try {
      const res = await axios.get(`${API_BASE}/tmdb/genres`);
      setGenres(res.data.genres || []);
    } catch {
      alert("Lỗi tải thể loại");
    }
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    console.log("Input change:", name, value, files);
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

  function openAddForm() {
    console.log("Open add form");
    setEditMovie(null);
    setFormData({
      title: "",
      description: "",
      year: "",
      country: "",
      genre: "",
      actors: "",
      trailer: "",
      poster: null,
      video: null,
      trailer_file: null,
      gallery: []
    });
  }

  function openEditForm(movie) {
    setEditMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      year: movie.year,
      country: movie.country,
      genre: movie.genre,
      actors: (movie.actors || []).join(", "),
      trailer: movie.trailer || "",
      poster: null,
      video: null,
      trailer_file: null,
      gallery: []
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      alert("Bạn chưa đăng nhập admin");
      return;
    }
    const form = new FormData();
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
    } catch (e) {
      alert(e.response?.data?.message || "Lỗi gửi dữ liệu");
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

  // Kiểm tra điều kiện hiển thị form: nếu editMovie != null hoặc form có dữ liệu
  const showForm = editMovie !== null || !!formData.title || !!formData.description;

  return (
    <div className="pt-40 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl mb-6 font-bold">Quản lý phim (Admin)</h1>

      <button
        onClick={openAddForm}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Thêm phim mới
      </button>

      {loading && <div>Đang tải...</div>}

      <table className="w-full border border-gray-300 mb-10 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Tiêu đề</th>
            <th className="p-2 border">Năm</th>
            <th className="p-2 border">Thể loại</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((m) => (
            <tr key={m.id} className="border-b hover:bg-gray-100">
              <td className="p-2 border">{m.id}</td>
              <td className="p-2 border">{m.title}</td>
              <td className="p-2 border">{m.year}</td>
              <td className="p-2 border">{m.genre}</td>
              <td className="p-2 border space-x-2">
                <button
                  onClick={() => openEditForm(m)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 space-y-4 border p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">
            {editMovie ? "Sửa phim" : "Thêm phim mới"}
          </h2>

          <input
            name="title"
            placeholder="Tiêu đề"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          <textarea
            name="description"
            placeholder="Mô tả"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
            rows={4}
          />

          <input
            name="year"
            type="number"
            placeholder="Năm"
            value={formData.year}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          <input
            name="country"
            placeholder="Quốc gia"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />

          {/* Dropdown genres */}
          <select
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">-- Chọn thể loại --</option>
            {genres.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            name="actors"
            placeholder="Diễn viên (phân cách dấu phẩy)"
            value={formData.actors}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <input
            name="trailer"
            placeholder="Link trailer"
            value={formData.trailer}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <label>
            Poster:
            <input
              name="poster"
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="block mt-1"
            />
          </label>

          <label>
            Video phim:
            <input
              name="video"
              type="file"
              accept="video/*"
              onChange={handleChange}
              className="block mt-1"
            />
          </label>

          <label>
            Trailer file:
            <input
              name="trailer_file"
              type="file"
              accept="video/*"
              onChange={handleChange}
              className="block mt-1"
            />
          </label>

          <label>
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

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
          >
            {loading ? "Đang gửi..." : editMovie ? "Cập nhật" : "Thêm mới"}
          </button>

          {editMovie && (
            <button
              type="button"
              onClick={() => {
                setEditMovie(null);
                setFormData({
                  title: "",
                  description: "",
                  year: "",
                  country: "",
                  genre: "",
                  actors: "",
                  trailer: "",
                  poster: null,
                  video: null,
                  trailer_file: null,
                  gallery: [],
                });
              }}
              className="ml-4 bg-gray-400 text-black px-4 py-2 rounded"
            >
              Hủy
            </button>
          )}
        </form>
      )}
    </div>
  );
}
