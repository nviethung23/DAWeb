import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { discoverMoviesByGenre } from "../services/tmdbService";
import MovieCard from "../components/MovieCard";
import MovieCardPopup from "../components/MovieCardPopup";
import MovieAdvancedFilterBar from "../components/MovieAdvancedFilterBar";
import axios from "axios";

const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 520;
const GAP = 12;
const MOVIES_PER_PAGE = 18;

export default function GenrePage() {
  const { id } = useParams();
  const [movies, setMovies] = useState([]);
  const [genreName, setGenreName] = useState("");
  const [loading, setLoading] = useState(true);
  const [allGenres, setAllGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [advancedFilter, setAdvancedFilter] = useState({
    country: "",
    year: "",
    age: "",
    sort: "popularity.desc"
  });
  const [popupInfo, setPopupInfo] = useState({ movie: null, pos: null });
  const leaveTimer = useRef(null);

  // refs cho card
  const cardRefs = useRef({});

  function getCardRef(id) {
    if (!cardRefs.current[id]) {
      cardRefs.current[id] = React.createRef();
    }
    return cardRefs.current[id];
  }

  // Lấy danh sách thể loại
  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await axios.get("http://localhost:5000/api/tmdb/genres");
        setAllGenres(res.data.genres);
      } catch {
        setAllGenres([]);
      }
    }
    fetchGenres();
  }, []);

  // Reset trang về 1 khi đổi thể loại hoặc filter
  useEffect(() => {
    setPage(1);
  }, [id, advancedFilter]);

  // Lấy phim khi page/id/filter đổi
  useEffect(() => {
    setLoading(true);
    cardRefs.current = {};
    async function fetchData() {
      try {
        // Lấy lại tên thể loại
        const genreRes = await axios.get("http://localhost:5000/api/tmdb/genres");
        const genre = genreRes.data.genres.find(g => String(g.id) === String(id));
        setGenreName(
          !id || id === "" || id === "all"
            ? "Tất cả thể loại"
            : genre?.name || `Thể loại #${id}`
        );

        // Lấy phim đã filter và paging
        const { results, total_pages } = await discoverMoviesByGenre(
          id || "",
          advancedFilter,
          page
        );

        // Lọc và map lại danh sách phim (chỉ lấy phim đủ điều kiện, không lỗi poster)
        const thisYear = new Date().getFullYear();
        const normalized = (results || []).filter(item => {
          const year = Number((item.release_date || "").split("-")[0]);
          return (
            year &&
            year <= thisYear &&
            item.poster_path &&
            item.overview &&
            item.overview.length > 0
          );
        }).map(item => ({
          ...item,
          from: "tmdb",
          name: item.title || item.name,
          year: (item.release_date || "").split("-")[0],
          poster: item.poster_path
            ? "https://image.tmdb.org/t/p/w500" + item.poster_path
            : "",
        }));

        setMovies(normalized.slice(0, MOVIES_PER_PAGE)); // Sửa lại chỗ này
        setTotalPages(total_pages);
      } catch {
        setMovies([]);
        setGenreName(!id || id === "" || id === "all" ? "Tất cả thể loại" : `Thể loại #${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    setPopupInfo({ movie: null, pos: null }); // Reset popup khi đổi filter
  }, [id, advancedFilter, page]);

  function handleCardHover(movie, cardRef) {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (cardRef && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      let x = rect.left + window.scrollX - (POPUP_WIDTH - rect.width) / 2;
      let y = rect.top + window.scrollY - (POPUP_HEIGHT - rect.height) / 2 - 16;
      x = Math.max(GAP, Math.min(x, window.innerWidth - POPUP_WIDTH - GAP));
      y = Math.max(GAP, Math.min(y, window.innerHeight + window.scrollY - POPUP_HEIGHT - GAP));
      setPopupInfo({ movie, pos: { x, y, w: POPUP_WIDTH, h: POPUP_HEIGHT } });
    }
  }

  function handleLeave() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => {
      setPopupInfo({ movie: null, pos: null });
    }, 160);
  }

  function handlePopupEnter() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }

  // Đóng popup khi cuộn trang
  useEffect(() => {
    function handleWindowScroll() {
      setPopupInfo({ movie: null, pos: null });
    }
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  // UI nút chuyển trang
  function Paging() {
    return (
      <div className="flex justify-center items-center gap-3 mt-8">
        <button
          className="bg-gray-800 px-4 py-2 rounded text-white disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          ← Trang trước
        </button>
        <span className="text-white font-semibold">
          Trang {page} / {totalPages}
        </span>
        <button
          className="bg-gray-800 px-4 py-2 rounded text-white disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        >
          Trang sau →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1b] w-full">
      <div className="pt-24 pb-2 px-4 max-w-screen-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 pt-6 text-white">
          Thể loại: {genreName}
        </h2>
        {/* Filter nâng cao */}
        <MovieAdvancedFilterBar
          genres={allGenres}
          filter={advancedFilter}
          onChange={setAdvancedFilter}
          activeGenreId={id || ""}
        />

        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải phim...</div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Không có phim nào trong thể loại này.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-7 pt-6">
              {movies.map(movie => (
                <MovieCard
                  key={movie.id}
                  ref={getCardRef(movie.id)}
                  movie={movie}
                  onHover={handleCardHover}
                  onLeave={handleLeave}
                />
              ))}
            </div>
            <Paging />
          </>
        )}
      </div>
      {popupInfo.movie && (
        <MovieCardPopup
          movie={popupInfo.movie}
          pos={popupInfo.pos}
          onMouseEnter={handlePopupEnter}
          onMouseLeave={handleLeave}
        />
      )}
    </div>
  );
}
