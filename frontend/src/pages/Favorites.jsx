import React, { useEffect, useState, useRef } from "react";
import { useFavoriteMovies } from "../hooks/useFavoriteMovies";
import MovieCard from "../components/MovieCard";
import MovieCardPopup from "../components/MovieCardPopup";

const BASE_URL = "";

export default function Favorites() {
  const { favoriteIds, loading } = useFavoriteMovies();
  const [movies, setMovies] = useState([]);
  const [popup, setPopup] = useState(null);
  const popupTimer = useRef();
  const closeTimer = useRef();

  useEffect(() => {
    if (!favoriteIds.length) {
      setMovies([]);
      return;
    }
    Promise.all(
      favoriteIds.map((fav) =>
        fetch(`${BASE_URL}/api/tmdb/movie/${fav.id}`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      setMovies(results.filter(Boolean));
    });
  }, [favoriteIds]);

  function handleMovieHover(movie, cardRef) {
    clearTimeout(popupTimer.current);
    clearTimeout(closeTimer.current);
    popupTimer.current = setTimeout(() => {
      if (!cardRef?.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const headerHeight = 64;
      const popupWidth = Math.max(rect.width + 40, 340);
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
        },
      });
    }, 400);
  }

  function handleMovieLeave() {
    clearTimeout(popupTimer.current);
    closeTimer.current = setTimeout(() => {
      setPopup(null);
    }, 240); // 240ms, vừa đủ để chuyển sang popup
  }

  function handlePopupEnter() {
    clearTimeout(closeTimer.current);
  }

  function handlePopupLeave() {
    setPopup(null);
  }

  return (
    <div className="min-h-screen bg-[#18181c] pt-40 px-4 pb-16 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-pink-400 mb-12 text-center tracking-wide drop-shadow-xl">
        Danh sách phim yêu thích
      </h1>
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center text-white/70 py-32">
          Bạn chưa có phim yêu thích nào.
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              xl:grid-cols-6
              gap-8
              mx-auto
            "
            style={{ maxWidth: "1200px" }}
          >
            {movies.map(
              (movie, idx) =>
                movie &&
                movie.id && (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onHover={(m, ref) => handleMovieHover(m, ref)}
                    onLeave={handleMovieLeave}
                  />
                )
            )}
          </div>
          {popup && (
            <MovieCardPopup
              movie={popup.movie}
              pos={popup.pos}
              onMouseEnter={handlePopupEnter}
              onMouseLeave={handlePopupLeave}
            />
          )}
        </div>
      )}
    </div>
  );
}
