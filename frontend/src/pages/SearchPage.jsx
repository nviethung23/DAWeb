import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import MovieCardPopup from "../components/MovieCardPopup";
import noAvatar from "../assets/no_avatar.jpg";

const TMDB_API_KEY = "beede3bb5fc88310916252b96f99062a"; // Thay bằng API key thật nhé

const LANGUAGES = [
  { code: "vi-VN", label: "Tiếng Việt" },
  { code: "en-US", label: "English" },
];

const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 520;
const GAP = 12;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const getKeyword = () => query.get("keyword") || query.get("q") || "";
  const [keyword, setKeyword] = useState(getKeyword());
  const [type, setType] = useState("movie");
  const [lang, setLang] = useState(LANGUAGES[0].code);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popupInfo, setPopupInfo] = useState({ movie: null, pos: null, cardRef: null });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const leaveTimer = useRef(null);
  const cardRefs = useRef({});

  function getCardRef(id) {
    if (!cardRefs.current[id]) {
      cardRefs.current[id] = React.createRef();
    }
    return cardRefs.current[id];
  }

  // Update keyword khi url thay đổi
  useEffect(() => {
    setKeyword(getKeyword());
    setPage(1); // reset page khi keyword/type/lang thay đổi
  }, [query]);

  // Reset page khi đổi type hoặc lang
  useEffect(() => {
    setPage(1);
  }, [type, lang]);

  // Fetch dữ liệu khi keyword, type, lang, page thay đổi
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setTotalPages(1);
      return;
    }
    setLoading(true);
    axios
      .get(`https://api.themoviedb.org/3/search/${type}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: lang,
          query: keyword,
          include_adult: false,
          page,
        },
      })
      .then((res) => {
        setTotalPages(res.data.total_pages || 1);
        setResults(res.data.results || []);
      })
      .catch(() => {
        setResults([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [type, lang, keyword, page]);

  function updatePopupPos(cardRef) {
    if (!cardRef || !cardRef.current) return null;
    const rect = cardRef.current.getBoundingClientRect();
    let x = rect.left + window.scrollX - (POPUP_WIDTH - rect.width) / 2;
    let y = rect.top + window.scrollY - (POPUP_HEIGHT - rect.height) / 2 - 16;
    x = Math.max(GAP, Math.min(x, window.innerWidth - POPUP_WIDTH - GAP));
    y = Math.max(GAP, Math.min(y, window.innerHeight + window.scrollY - POPUP_HEIGHT - GAP));
    return { x, y, w: POPUP_WIDTH, h: POPUP_HEIGHT };
  }

  function handleCardHover(movie, cardRef) {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    const pos = updatePopupPos(cardRef);
    if (pos) setPopupInfo({ movie, pos, cardRef });
  }
  function handleLeave() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => {
      setPopupInfo({ movie: null, pos: null, cardRef: null });
    }, 160);
  }
  function handlePopupEnter() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }

  useEffect(() => {
    if (!popupInfo.movie || !popupInfo.cardRef) return;

    function handleScrollResize() {
      const pos = updatePopupPos(popupInfo.cardRef);
      if (pos) {
        setPopupInfo((prev) => ({ ...prev, pos }));
      }
    }
    window.addEventListener("scroll", handleScrollResize, { passive: true });
    window.addEventListener("resize", handleScrollResize);

    return () => {
      window.removeEventListener("scroll", handleScrollResize);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [popupInfo.movie, popupInfo.cardRef]);

  function handleActorClick(id) {
    navigate(`/actor/${id}`);
  }

  function handlePrevPage() {
    if (page > 1) setPage(page - 1);
  }

  function handleNextPage() {
    if (page < totalPages) setPage(page + 1);
  }

  return (
    <div className="min-h-screen bg-[#18181c] pt-28 px-4 pb-12">
      <div className="max-w-screen-xl mx-auto flex flex-wrap justify-between items-center gap-y-3 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow-sm">
          Kết quả tìm kiếm <span className="text-lime-400">"{keyword}"</span>
        </h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setType("movie")}
            className={`px-6 py-2 rounded-2xl font-semibold text-base border transition
              ${
                type === "movie"
                  ? "bg-lime-400 text-black border-lime-400 shadow-lg"
                  : "bg-[#22232c] text-white border-[#333] hover:bg-lime-400/30 hover:text-lime-200"
              }`}
          >
            Phim
          </button>
          <button
            onClick={() => setType("person")}
            className={`px-6 py-2 rounded-2xl font-semibold text-base border transition
              ${
                type === "person"
                  ? "bg-lime-400 text-black border-lime-400 shadow-lg"
                  : "bg-[#22232c] text-white border-[#333] hover:bg-lime-400/30 hover:text-lime-200"
              }`}
          >
            Diễn viên
          </button>
          <div className="ml-6 flex items-center gap-2">
            <span className="text-white/80 text-base font-bold">
              <i className="fa fa-globe"></i>
            </span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-xl px-3 py-2 bg-[#22232c] text-white text-sm border border-[#333] focus:ring-2 focus:ring-lime-400"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto" style={{ maxWidth: 1300 }}>
        {loading ? (
          <div className="text-white text-center mt-10 text-lg font-semibold">
            Đang tải kết quả...
          </div>
        ) : results.length === 0 ? (
          <div className="text-center text-white/70 py-20 text-lg">
            Không tìm thấy kết quả phù hợp.
          </div>
        ) : type === "movie" ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-7 pt-4">
              {results.slice(0, 15).map((movie) => (
                <MovieCard
                  key={movie.id}
                  ref={getCardRef(movie.id)}
                  movie={{
                    ...movie,
                    name: movie.title || movie.name,
                    poster: movie.poster_path
                      ? "https://image.tmdb.org/t/p/w500" + movie.poster_path
                      : "",
                    year: (movie.release_date || "").split("-")[0],
                  }}
                  onHover={handleCardHover}
                  onLeave={handleLeave}
                />
              ))}
            </div>
            {popupInfo.movie && (
              <MovieCardPopup
                movie={popupInfo.movie}
                pos={popupInfo.pos}
                onMouseEnter={handlePopupEnter}
                onMouseLeave={handleLeave}
              />
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-7 pt-4">
            {results.slice(0, 15).map((actor, i) => (
              <div
                key={actor.id || i}
                className="group relative rounded-2xl overflow-hidden shadow-[0_4px_24px_0_rgba(0,0,0,0.18)] bg-[#22232c] transition cursor-pointer"
                onClick={() => handleActorClick(actor.id)}
              >
                <img
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w342${actor.profile_path}`
                      : noAvatar
                  }
                  alt={actor.name}
                  className="w-full h-64 object-cover transition duration-300 group-hover:scale-[1.03] bg-[#23232b]"
                  loading="lazy"
                  onError={(e) => {
                    if (e.target.src !== noAvatar) e.target.src = noAvatar;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/0" />
                <p
                  className="absolute bottom-2 left-0 w-full text-center text-white font-bold text-base drop-shadow-sm tracking-wide"
                  style={{ textShadow: "0 1px 5px #222" }}
                >
                  {actor.name}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Nút phân trang */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className={`px-4 py-2 rounded bg-lime-400 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Prev
          </button>
          <span className="text-white font-semibold flex items-center select-none">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded bg-lime-400 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
