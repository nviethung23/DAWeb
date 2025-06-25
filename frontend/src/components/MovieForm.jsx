import React, { useState } from "react";

export default function MovieForm({ onSubmit, initial = {}, submitLabel = "Thêm phim" }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    year: initial.year || "",
    description: initial.description || "",
    poster: initial.poster || "",
    trailer: initial.trailer || ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.name && form.year) {
      onSubmit(form);
      setForm({ name: "", year: "", description: "", poster: "", trailer: "" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 mb-6 shadow">
      <div className="mb-3">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên phim" className="border px-2 py-1 rounded w-full" required />
      </div>
      <div className="mb-3">
        <input name="year" value={form.year} onChange={handleChange} placeholder="Năm phát hành" className="border px-2 py-1 rounded w-full" required />
      </div>
      <div className="mb-3">
        <input name="poster" value={form.poster} onChange={handleChange} placeholder="Link poster (ảnh)" className="border px-2 py-1 rounded w-full" />
      </div>
      <div className="mb-3">
        <input name="trailer" value={form.trailer} onChange={handleChange} placeholder="Link trailer Youtube" className="border px-2 py-1 rounded w-full" />
      </div>
      <div className="mb-3">
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả phim" className="border px-2 py-1 rounded w-full" rows={3} />
      </div>
      <button className="bg-green-600 text-white px-4 py-2 rounded">{submitLabel}</button>
    </form>
  );
}
