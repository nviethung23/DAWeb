import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { PlayCircle, Heart, Info, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavoriteMovies } from "../hooks/useFavoriteMovies";
import { useWatchLaterMovies } from "../hooks/useWatchLaterMovies";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function MovieCardPopup({
  movie,
  pos,
  genresList,
  onMouseEnter,
  onMouseLeave,
  onClose,
}) {
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteMovies();
  const {
    isWatchLater,
    addWatchLater,
    removeWatchLater,
  } = useWatchLaterMovies();

  useEffect(() => {
    function handleScroll() {
      onClose();
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onClose]);

  if (!movie || !pos) return null;

  let genres = [];
  if (Array.isArray(movie.genre_ids) && genresList) {
    genres = movie.genre_ids
      .map((id) => genresList.find((g) => g.id === id)?.name)
      .filter(Boolean);
  }

  async function handleLike() {
    try {
      if (isFavorite(movie.id)) {
        const ok = await removeFavorite(movie.id);
        if (ok) toast("Đã xoá khỏi yêu thích!", { icon: "💔" });
        else toast.error("Lỗi thao tác! Thử lại sau.");
      } else {
        const ok = await addFavorite(movie.id);
        if (ok) toast("Đã thêm vào yêu thích!", { icon: "❤️" });
        else toast.error("Bạn cần đăng nhập để thêm vào yêu thích!");
      }
    } catch {
      toast.error("Bạn cần đăng nhập để thêm vào yêu thích!");
    }
  }

  async function handleWatchLater() {
    try {
      if (isWatchLater(movie.id)) {
        const ok = await removeWatchLater(movie.id);
        if (ok) toast("Đã xoá khỏi xem sau!", { icon: "🕒" });
        else toast.error("Lỗi thao tác! Thử lại sau.");
      } else {
        const ok = await addWatchLater(movie.id);
        if (ok) toast("Đã thêm vào xem sau!", { icon: "🕒" });
        else toast.error("Bạn cần đăng nhập để thêm vào xem sau!");
      }
    } catch {
      toast.error("Bạn cần đăng nhập để thêm vào xem sau!");
    }
  }

  const handleGoDetail = () => {
    navigate(`/movie/${movie.id}`);
  };

  return ReactDOM.createPortal(
    <>
      <Toaster position="top-right" />
      <AnimatePresence>
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.22, ease: [0.3, 0.7, 0.4, 1] }}
          className="fixed z-[9999] rounded-2xl shadow-2xl overflow-hidden"
          style={{
            left: pos.x,
            top: pos.y,
            width: pos.w ? Math.max(pos.w, 540) : 540,
            background: "rgba(35,37,50,0.97)",
            color: "#fff",
            boxShadow: "0 16px 48px #000b",
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="relative w-full" style={{ aspectRatio: "16/7" }}>
            <img
              src={movie.banner || movie.poster || movie.backdrop_path}
              alt={movie.name || movie.title}
              className="w-full h-full object-cover absolute inset-0"
              style={{
                objectPosition: "top center",
                filter: "brightness(0.7)",
              }}
            />
            <div
              className="absolute left-0 right-0 bottom-0 h-20"
              style={{
                background:
                  "linear-gradient(180deg,rgba(35,37,50,0) 0%,#232532 95%)",
                pointerEvents: "none",
              }}
            />
          </div>
          <div className="flex flex-col justify-end px-6 pb-4 pt-0">
            <div className="font-bold text-xl mb-1 line-clamp-1">
              {movie.name || movie.title || "Không rõ tên"}
            </div>
            {movie.original_title && movie.original_title !== movie.name && (
              <div className="text-sm text-yellow-100 mb-1 line-clamp-1">
                {movie.original_title}
              </div>
            )}
            {genres.length > 0 && (
              <div className="text-xs text-yellow-200 mb-2">
                {genres.join(" • ")}
              </div>
            )}
            <div className="flex gap-2 mb-2 flex-wrap items-center">
              {movie.rating && (
                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                  IMDb {movie.rating}
                </span>
              )}
              {movie.vote_average && (
                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
                  IMDb {movie.vote_average}
                </span>
              )}
              {movie.year && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded">
                  {movie.year}
                </span>
              )}
              {movie.release_date && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded">
                  {movie.release_date.slice(0, 4)}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-300 mb-2 line-clamp-3">
              {movie.description || movie.overview || "Không có mô tả"}
            </div>
            <div className="flex gap-4 mt-2 items-center">
              <button
                className="flex items-center justify-center gap-2  py-2 rounded bg-yellow-400 text-black font-bold text-sm min-w-[110px] h-10"
                onClick={handleGoDetail}
              >
                <PlayCircle size={16} /> Xem ngay
              </button>
              <button
                className={`flex items-center justify-center gap-2  py-2 rounded transition text-white text-sm min-w-[110px] h-10 ${
                  isFavorite(movie.id)
                    ? "bg-pink-500/90 hover:bg-pink-600"
                    : "bg-white/10 hover:bg-yellow-500/80 hover:text-black"
                }`}
                onClick={handleLike}
              >
                <Heart
                  size={16}
                  fill={isFavorite(movie.id) ? "#fff" : "none"}
                  color={isFavorite(movie.id) ? "#fff" : "currentColor"}
                  className={`transition ${
                    isFavorite(movie.id) ? "animate-pulse" : ""
                  }`}
                />
                {isFavorite(movie.id) ? "Đã thích" : "Thích"}
              </button>

              <button
                className={`flex items-center justify-center gap-2  py-2 rounded transition text-white text-sm min-w-[110px] h-10 ${
                  isWatchLater(movie.id)
                    ? "bg-yellow-400 text-black hover:bg-yellow-500"
                    : "bg-white/10 hover:bg-yellow-500/80 hover:text-black"
                }`}
                onClick={handleWatchLater}
              >
                <Clock
                  size={16}
                  fill={isWatchLater(movie.id) ? "currentColor" : "none"}
                  color={isWatchLater(movie.id) ? "currentColor" : "currentColor"}
                  className={`transition ${
                    isWatchLater(movie.id) ? "animate-pulse" : ""
                  }`}
                />
                {isWatchLater(movie.id) ? "Đã xem sau" : "Xem sau"}
              </button>

              <button
                className="flex items-center justify-center gap-2  py-2 rounded bg-white/10 text-white text-sm min-w-[110px] h-10"
                onClick={handleGoDetail}
              >
                <Info size={16} /> Chi tiết
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>,
    document.body
  );
}
