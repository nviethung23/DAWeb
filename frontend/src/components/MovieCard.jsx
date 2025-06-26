import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useWatchLaterMovies } from "../hooks/useWatchLaterMovies";
import { Clock } from "lucide-react"; // icon xem sau
import noPoster from "../assets/no_poster.jpg"; // import ảnh mặc định

const TMDB_API_KEY = "beede3bb5fc88310916252b96f99062a"; 

function getPoster(movie) {
  if (movie.poster) return movie.poster;
  if (movie.poster_path)
    return `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  if (movie.backdrop_path)
    return `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;
  return noPoster;  // dùng ảnh mặc định nếu không có
}

export default function MovieCard({ movie, onHover, onLeave }) {
  const cardRef = useRef();

  const { isWatchLater, addWatchLater, removeWatchLater } = useWatchLaterMovies();
  const [loadingWatchLater, setLoadingWatchLater] = useState(false);

  async function toggleWatchLater(e) {
    e.preventDefault();
    e.stopPropagation();
    if (loadingWatchLater) return;

    setLoadingWatchLater(true);
    try {
      if (isWatchLater(movie.id)) {
        await removeWatchLater(movie.id);
      } else {
        await addWatchLater(movie.id);
      }
    } finally {
      setLoadingWatchLater(false);
    }
  }

  async function handleHover() {
    if (typeof onHover !== "function") return;

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
      onHover(movie, cardRef);
    }
  }

  const hoverProps =
    typeof onHover === "function" && typeof onLeave === "function"
      ? {
          onMouseEnter: handleHover,
          onMouseLeave: onLeave,
        }
      : {};

  function handleImgError(e) {
    e.target.onerror = null;
    e.target.src = noPoster;
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

        {/* Nút Xem Sau góc trên phải */}
        <button
          type="button"
          onClick={toggleWatchLater}
          disabled={loadingWatchLater}
          title={isWatchLater(movie.id) ? "Bỏ xem sau" : "Xem sau"}
          className={`absolute top-2 right-2 p-1 rounded-full transition
            ${
              isWatchLater(movie.id)
                ? "bg-yellow-400 text-black hover:bg-yellow-500"
                : "bg-white/30 text-white hover:bg-white/50"
            }
          `}
        >
          <Clock size={20} />
        </button>
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
