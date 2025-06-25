import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import noAvatar from "../assets/no_avatar.jpg"; // Đổi path này nếu file ở nơi khác

export default function Actors() {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const totalPages = 50;

  useEffect(() => {
    async function fetchActors() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:5000/api/actors/popular?page=${page}`);
        if (Array.isArray(res.data)) {
          setActors(res.data);
        } else {
          throw new Error("API trả về không đúng định dạng mảng!");
        }
      } catch (err) {
        setError("Không thể tải danh sách diễn viên. Thử lại sau!");
      } finally {
        setLoading(false);
      }
    }
    fetchActors();
  }, [page]);

  // Đảm bảo luôn có 20 ô (5x4) trên mỗi trang
  const visibleActors = [...actors.slice(0, 20)];
  while (visibleActors.length < 20) visibleActors.push(null);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#18181c]">
        <i className="animate-spin bi bi-arrow-repeat text-5xl text-lime-400 mb-4" />
        <span className="text-white text-lg font-semibold">Đang tải danh sách diễn viên...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#18181c]">
        <p className="text-center text-red-400 py-20">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181c] pt-28 px-4 pb-12">
      <h1 className="text-3xl font-bold text-white mb-8 text-center tracking-wide" style={{ fontFamily: "inherit" }}>
        Diễn viên
      </h1>
      <div className="mx-auto" style={{ maxWidth: 1300 }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-7">
          {visibleActors.map((actor, i) =>
            actor && actor.id ? (
              <Link
                to={`/actors/${actor.id}`}
                key={actor.id}
                className="group relative rounded-2xl overflow-hidden shadow-[0_4px_24px_0_rgba(0,0,0,0.18)] bg-[#22232c] transition"
              >
                <img
                  src={actor.avatar}
                  alt={actor.name}
                  className="w-full h-64 object-cover transition duration-300 group-hover:scale-[1.03] bg-[#23232b]"
                  loading="lazy"
                  onError={e => { if (e.target.src !== noAvatar) e.target.src = noAvatar; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/0" />
                <p className="absolute bottom-2 left-0 w-full text-center text-white font-bold text-base drop-shadow-sm tracking-wide"
                   style={{ textShadow: "0 1px 5px #222" }}>
                  {actor.name}
                </p>
              </Link>
            ) : (
              // Placeholder nếu thiếu actor
              <div
                key={"ph" + i}
                className="rounded-2xl overflow-hidden shadow bg-[#20212a] opacity-50 flex flex-col items-center justify-center h-64"
              >
                <img
                  src={noAvatar}
                  alt=""
                  className="w-20 h-20 object-cover rounded-full mb-2"
                  loading="lazy"
                  style={{ filter: "grayscale(1) opacity(0.6)" }}
                />
              </div>
            )
          )}
        </div>
        {/* PHÂN TRANG */}
        <div className="flex justify-center gap-3 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg font-semibold bg-[#23232b] text-white border border-[#333] hover:bg-lime-400 hover:text-black transition disabled:opacity-40"
          >
            Trang trước
          </button>
          <span className="text-white font-bold text-lg px-4 py-2 rounded-lg bg-[#23232b]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg font-semibold bg-[#23232b] text-white border border-[#333] hover:bg-lime-400 hover:text-black transition disabled:opacity-40"
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
}
