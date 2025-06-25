import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { PlayCircle, Heart, Info } from "lucide-react";

export default function HeroBanner({ movie, fadeIn = false, fadeOut = false }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const previewTimeout = useRef();

  useEffect(() => {
    async function fetchTrailer() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/tmdb/movie/${movie.id}/videos`
        );
        const trailer = res.data.results?.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        );
        setTrailerKey(trailer?.key || null);
      } catch {
        setTrailerKey(null);
      }
    }
    fetchTrailer();
  }, [movie.id]);

  // Ngăn tắt trailer quá nhanh khi di chuột giữa nút và preview
  const handleMouseEnter = () => {
    clearTimeout(previewTimeout.current);
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    // Delay một chút để user di chuyển chuột vào trailer không bị mất ngay
    previewTimeout.current = setTimeout(() => {
      setShowPreview(false);
    }, 220);
  };

  return (
    <section
      className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out 
        ${fadeIn ? "opacity-100 scale-100 blur-0 z-20" : ""} 
        ${fadeOut ? "opacity-0 scale-105 blur-sm z-10" : ""}`}
      style={{ backgroundImage: `url(${movie.backdrop})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      <div className="relative z-30 max-w-5xl mx-auto px-6 pt-32 text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-xl mb-6">{movie.name}</h1>
        <div className="flex gap-3 flex-wrap items-center text-sm text-white/90 mb-6">
          {movie.rating && (
            <span className="bg-yellow-500 text-black font-semibold px-2 py-1 rounded text-xs">
              IMDb {movie.rating.toFixed(1)}
            </span>
          )}
          {movie.year && (
            <span className="bg-white/10 px-2 py-1 rounded text-xs">{movie.year}</span>
          )}
          {movie.category && (
            <span className="bg-pink-500/80 px-2 py-1 rounded text-xs">{movie.category}</span>
          )}
        </div>
        <p className="text-lg text-white/80 max-w-3xl mb-8 leading-relaxed">
          {movie.description}
        </p>
        <div
          className="flex items-center gap-4 relative group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-500 text-black text-lg font-semibold hover:brightness-110 transition shadow-lg">
            <PlayCircle className="w-6 h-6" /> Xem ngay
          </button>
          {/* Trailer Preview - hover được vào cả nút và trailer */}
          {showPreview && trailerKey && (
            <div
              className="absolute top-full left-0 mt-4 w-96 z-50 shadow-xl rounded overflow-hidden border border-white/10 bg-black animate-fade-in"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <iframe
                width="100%"
                height="215"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1`}
                title="Trailer Preview"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="rounded"
              ></iframe>
            </div>
          )}
          <button className="px-6 py-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition shadow">
            <Heart className="w-5 h-5" />
          </button>
          <button className="px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition shadow">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
