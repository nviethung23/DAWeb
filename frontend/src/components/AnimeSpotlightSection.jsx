import React, { useState, useEffect, useRef } from "react";
import { PlayCircle, Heart, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnimeSpotlightSection({ animeList = [] }) {
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const autoSlideRef = useRef();
  const navigate = useNavigate();
  const spotlight = animeList[spotlightIndex];

  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSpotlightIndex((prev) => (prev + 1) % animeList.length);
        setFade(true);
      }, 300);
    }, 8000);
    return () => clearInterval(autoSlideRef.current);
  }, [animeList]);

  if (!spotlight) return null;

  return (
    <section className="w-full flex justify-center relative my-6">
      <div className="relative w-full max-w-[1440px] rounded-3xl overflow-hidden shadow-2xl" style={{minHeight: 430, background: '#13151c'}}>
        <div className="w-full h-[430px] flex flex-row items-stretch relative">
          {/* Background image full bleed */}
          <img
            src={spotlight.backdrop || spotlight.poster}
            alt={spotlight.name}
            className={`absolute top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
            style={{ borderRadius: 0 }}
          />
          {/* Overlay gradient bên trái */}
          <div className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg,#191b22 25%,rgba(25,27,34,0.80) 55%,rgba(25,27,34,0.18) 85%,transparent 100%)'
            }}>
          </div>
          {/* Content left */}
          <div className="relative z-20 flex flex-col justify-center pl-12 pr-3 py-10" style={{width: '37%', minWidth: 320, maxWidth: 520}}>
            <h3 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">{spotlight.name}</h3>
            {spotlight.original_title && (
              <div className="text-yellow-300 font-semibold mb-3">{spotlight.original_title}</div>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              {spotlight.rating && (
                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-semibold">IMDb {spotlight.rating.toFixed(1)}</span>
              )}
              {spotlight.year && (
                <span className="bg-white/10 text-white px-2 py-1 rounded text-xs">{spotlight.year}</span>
              )}
              <span className="bg-white/10 text-white px-2 py-1 rounded text-xs">Hoạt Hình</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(spotlight.genre_names || []).slice(0, 3).map((g, i) => (
                <span key={i} className="bg-white/10 text-white px-2 py-1 rounded text-xs">{g}</span>
              ))}
            </div>
            <p className="text-white/90 mb-7 leading-relaxed max-w-xl drop-shadow-sm line-clamp-3">
              {spotlight.description || spotlight.overview || "Chưa có mô tả..."}
            </p>
            <div className="flex items-center gap-4 mt-6">
              <button className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 text-black text-2xl font-bold hover:brightness-110 transition shadow-lg">
                <PlayCircle className="w-8 h-8" />
              </button>
              <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition shadow">
                <Heart className="w-6 h-6" />
              </button>
              <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition shadow">
                <Info className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        {/* Poster carousel dưới */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-3 z-30">
          {animeList.map((movie, idx) => (
            <img
              key={movie.id}
              src={movie.poster}
              alt={movie.name}
              title={movie.name}
              onClick={() => setSpotlightIndex(idx)}
              className={`object-cover aspect-[3/4] w-[62px] h-[92px] rounded-xl border-4 cursor-pointer shadow-sm bg-[#191a21] transition duration-200 ${idx === spotlightIndex ? 'border-yellow-400 scale-110 shadow-lg z-10' : 'border-transparent opacity-60 hover:opacity-90'}`}
              style={{boxShadow: idx === spotlightIndex ? '0 2px 12px #000a' : undefined}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
