import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import MovieCardPopup from "../components/MovieCardPopup";
import axios from "axios";
import { createPortal } from "react-dom";

const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 520;

export default function Actorsdetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState(null);
  const [genresList, setGenresList] = useState([]);

  // Popup state
  const [popup, setPopup] = useState(null);
  const popupTimer = useRef(null);
  const closeTimer = useRef(null);
  const cardRefs = useRef({});

  useEffect(() => {
    setLoading(true);
    setActor(null);
    setError(null);

    // Lấy actor
    axios
      .get(`http://localhost:5000/api/actors/${id}`)
      .then((res) => setActor(res.data))
      .catch(() => setError("Không tìm thấy diễn viên!"))
      .finally(() => setLoading(false));

    // Lấy genres TMDB
    axios
      .get(`http://localhost:5000/api/tmdb/genres`)
      .then((res) => setGenresList(res.data || []))
      .catch(() => setGenresList([]));

    return () => {
      clearTimeout(popupTimer.current);
      clearTimeout(closeTimer.current);
    };
  }, [id]);

  function handleCardHover(movie) {
    clearTimeout(popupTimer.current);
    clearTimeout(closeTimer.current);
    popupTimer.current = setTimeout(() => {
      const ref = cardRefs.current[movie.id];
      if (!ref || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const headerHeight = 64;
      const popupWidth = Math.max(rect.width + 40, POPUP_WIDTH);
      let left = rect.left + window.scrollX - (popupWidth - rect.width) / 2;
      let top = rect.top + window.scrollY - 12;
      left = Math.max(8, Math.min(left, window.innerWidth - popupWidth - 8));
      if (top < headerHeight + 8) top = headerHeight + 8;
      setPopup({
        movie,
        pos: {
          x: left,
          y: top,
          w: popupWidth,
          h: POPUP_HEIGHT,
        },
      });
    }, 400);
  }

  function handleCardLeave() {
    clearTimeout(popupTimer.current);
    closeTimer.current = setTimeout(() => {
      setPopup(null);
    }, 240);
  }

  function handlePopupEnter() {
    clearTimeout(closeTimer.current);
  }

  function handlePopupLeave() {
    setPopup(null);
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#18181c]">
        <span className="text-white text-xl font-semibold">
          Đang tải thông tin diễn viên...
        </span>
      </div>
    );

  if (error || !actor)
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#18181c]">
        <p className="text-red-400">{error || "Không có dữ liệu!"}</p>
      </div>
    );

  // Nhóm phim theo năm
  const moviesByYear = {};
  actor.movies.forEach((m) => {
    const y = m.year || "Khác";
    if (!moviesByYear[y]) moviesByYear[y] = [];
    moviesByYear[y].push(m);
  });
  const sortedYears = Object.keys(moviesByYear)
    .filter((y) => y !== "Khác")
    .map(Number)
    .sort((a, b) => b - a);
  if (moviesByYear["Khác"]) sortedYears.push("Khác");

  return (
    <div className="min-h-screen bg-[#18181c] pt-20 px-6 pb-12 flex flex-col items-center">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full md:w-[310px] flex flex-col items-center bg-[#22232c] rounded-2xl p-8 mb-2 shadow">
          <img
            src={actor.avatar}
            alt={actor.name}
            className="w-40 h-40 object-cover rounded-2xl mb-2"
          />
          <h2 className="text-2xl font-bold text-white mb-2">{actor.name}</h2>
          <div className="flex gap-2 mb-2">
            <button className="px-3 py-1 bg-[#23232b] text-white rounded-full text-xs">
              Yêu thích
            </button>
            <button className="px-3 py-1 bg-[#23232b] text-white rounded-full text-xs">
              Chia sẻ
            </button>
          </div>
          <div className="text-sm text-gray-300 w-full mt-2">
            <div className="mb-1">
              <b>Tên gọi khác:</b> <span>{actor.altNames || "Đang cập nhật"}</span>
            </div>
            <div className="mb-1">
              <b>Giới thiệu:</b> <span>{actor.biography || "Đang cập nhật"}</span>
            </div>
            <div className="mb-1">
              <b>Giới tính:</b> <span>{actor.gender}</span>
            </div>
            <div className="mb-1">
              <b>Ngày sinh:</b> <span>{actor.born || "Đang cập nhật"}</span>
            </div>
          </div>
        </div>
        {/* RIGHT */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-white font-bold">Các phim đã tham gia</h3>
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded ${
                  viewMode === "grid"
                    ? "bg-white text-black font-bold"
                    : "bg-[#16171c] text-gray-200"
                }`}
                onClick={() => setViewMode("grid")}
              >
                Tất cả
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  viewMode === "timeline"
                    ? "bg-white text-black font-bold"
                    : "bg-[#16171c] text-gray-200"
                }`}
                onClick={() => setViewMode("timeline")}
              >
                Thời gian
              </button>
            </div>
          </div>

          {actor.movies.length === 0 && (
            <div className="text-gray-400 italic text-center mt-10">
              Chưa có dữ liệu phim.
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 relative">
              {actor.movies.map((movie) => {
                if (!cardRefs.current[movie.id]) {
                  cardRefs.current[movie.id] = React.createRef();
                }
                return (
                  <div
                    key={movie.id}
                    ref={cardRefs.current[movie.id]}
                    onMouseEnter={() => handleCardHover(movie)}
                    onMouseLeave={handleCardLeave}
                  >
                    <MovieCard movie={movie} />
                  </div>
                );
              })}
              {popup && popup.movie && (
                <>
                  {createPortal(
                    <MovieCardPopup
                      movie={popup.movie}
                      pos={popup.pos}
                      genresList={genresList}
                      onClose={handleCardLeave}
                      onPlayTrailer={() => {}}
                      onGoDetail={() => navigate(`/movie/${popup.movie.id}`)}
                      onMouseEnter={handlePopupEnter}
                      onMouseLeave={handlePopupLeave}
                    />,
                    document.body
                  )}
                </>
              )}
            </div>
          )}

          {/* TIMELINE VIEW */}
          {viewMode === "timeline" && (
            <div className="relative ml-4 mt-2 pb-10">
              <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-yellow-400/80 via-lime-400/50 to-transparent" />
              {sortedYears.map((year) => (
                <div key={year} className="relative mb-8 pl-8">
                  <div className="absolute -left-4 top-1.5 w-3 h-3 rounded-full bg-yellow-400 shadow"></div>
                  <div className="text-lg font-bold text-gray-200 mb-3 tracking-wide">
                    {year}
                  </div>
                  <div className="flex flex-wrap gap-6">
                    {moviesByYear[year].map((movie) => {
                      if (!cardRefs.current[movie.id]) {
                        cardRefs.current[movie.id] = React.createRef();
                      }
                      return (
                        <div
                          key={movie.id}
                          ref={cardRefs.current[movie.id]}
                          onMouseEnter={() => handleCardHover(movie)}
                          onMouseLeave={handleCardLeave}
                        >
                          <MovieCard movie={movie} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {popup && popup.movie && (
                <>
                  {createPortal(
                    <MovieCardPopup
                      movie={popup.movie}
                      pos={popup.pos}
                      genresList={genresList}
                      onClose={handleCardLeave}
                      onPlayTrailer={() => {}}
                      onGoDetail={() => navigate(`/movie/${popup.movie.id}`)}
                      onMouseEnter={handlePopupEnter}
                      onMouseLeave={handlePopupLeave}
                    />,
                    document.body
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
