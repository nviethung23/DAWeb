import React, { useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const TMDB_API_KEY = "beede3bb5fc88310916252b96f99062a96f99062a"; // Bạn dùng key thật nhé!

// Hàm lấy poster ưu tiên poster, nếu không có thì dùng backdrop, fallback ảnh no-image
function getPoster(movie) {
  if (movie.poster) return movie.poster;
  if (movie.poster_path)
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  if (movie.backdrop_path)
    return `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;
  return "/no-image.png"; // Đảm bảo bạn có file này trong /public
}

export default function MovieCard({ movie, onHover, onLeave }) {
  const cardRef = useRef();

  // Hàm gọi API lấy ảnh backdrop để show banner khi hover
  async function handleHover() {
    if (typeof onHover !== "function") return;

    // Nếu đã fetch rồi thì dùng cache
    if (movie._fetchedBackdrops) {
      const banners = movie._fetchedBackdrops;
      if (banners.length > 0) {
        const random = Math.floor(Math.random() * banners.length);
        const banner =
          "https://image.tmdb.org/t/p/original" + banners[random].file_path;
        onHover({ ...movie, banner }, cardRef);
        return;
      }
    }

    // Fetch lần đầu từ API TMDb
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/movie/${movie.id}/images?api_key=${TMDB_API_KEY}`
      );
      const backdrops = res.data.backdrops;
      movie._fetchedBackdrops = backdrops;
      if (backdrops.length > 0) {
        const random = Math.floor(Math.random() * backdrops.length);
        const banner =
          "https://image.tmdb.org/t/p/original" + backdrops[random].file_path;
        onHover({ ...movie, banner }, cardRef);
      } else {
        onHover(movie, cardRef);
      }
    } catch (e) {
      // Nếu lỗi API thì fallback luôn
      onHover(movie, cardRef);
    }
  }

  // Gán event hover nếu callback onHover, onLeave được truyền
  const hoverProps =
    typeof onHover === "function" && typeof onLeave === "function"
      ? {
          onMouseEnter: handleHover,
          onMouseLeave: onLeave,
        }
      : {};

  // Xử lý lỗi load ảnh poster
  function handleImgError(e) {
    e.target.onerror = null;
    e.target.src = "/no-image.png";
  }

  return (
    <Link
      to={`/movie/${movie.id}`}
      ref={cardRef}
      className="relative w-[156px] md:w-[180px] shrink-0 cursor-pointer block group"
      {...hoverProps}
      style={{ textDecoration: "none" }}
    >
      <div className="relative">
        <img
          src={getPoster(movie)}
          alt={movie.name || movie.title}
          className="rounded-xl object-cover w-full aspect-[2/3] shadow"
          onError={handleImgError}
          loading="lazy"
        />

        {/* Góc trái dưới: TMDB */}
        <div className="absolute left-2 bottom-2 flex items-center">
          <div
            className="flex items-center justify-center px-2 py-0.5 rounded-xl"
            style={{
              background: "#fff",
              border: "2px solid #01b4e4",
              boxShadow: "0 1px 5px #0003",
            }}
          >
            <span
              className="font-bold text-xs"
              style={{ color: "#01b4e4", letterSpacing: 1 }}
            >
              TMDB
            </span>
          </div>
        </div>

        {/* Góc phải dưới: Năm phát hành */}
        <span className="absolute right-2 bottom-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-bold shadow">
          {movie.year || movie.release_date?.slice(0, 4) || ""}
        </span>
      </div>
      <div
        className="font-bold text-base mt-2 text-white truncate"
        title={movie.name || movie.title}
      >
        {movie.name || movie.title}
      </div>
      {movie.original_title && movie.original_title !== movie.name && (
        <div className="text-xs text-gray-400 truncate" title={movie.original_title}>
          {movie.original_title}
        </div>
      )}
    </Link>
  );
}
