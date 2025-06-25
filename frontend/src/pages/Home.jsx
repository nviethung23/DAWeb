import React, { useEffect, useRef, useState, useMemo } from "react";
import { fetchAllMovies } from "../utils/fetchAllMovies";
import { fetchVietMovies } from "../utils/fetchVietMovies"; // import hàm lấy phim Việt
import axios from "axios";
import HeroBannerContainer from "../components/HeroBannerContainer";
import MovieSectionSlider from "../components/MovieSectionSlider";
import CategorySection from "../components/CategorySection";
import AnimeSpotlightSection from "../components/AnimeSpotlightSection";
import logo from "../assets/logo.png";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [vietMovies, setVietMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const autoSlideRef = useRef();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [genresRes, allMovies, vietMovieList] = await Promise.all([
          axios.get("http://localhost:5000/api/tmdb/genres"),
          fetchAllMovies(),
          fetchVietMovies(),
        ]);
        setGenres(genresRes.data.genres || []);
        setMovies(allMovies);
        setVietMovies(vietMovieList);
      } catch (e) {
        setGenres([]);
        setMovies([]);
        setVietMovies([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  function markSource(list) {
    return list
      .map(item => {
        const genreId = item.genre_ids?.[0];
        const genre = genres.find(g => g.id === genreId);
        return {
          ...item,
          name: item.title || item.name || "Không rõ tên",
          year: (item.release_date || "").split("-")[0],
          poster: item.poster_path
            ? "https://image.tmdb.org/t/p/w500" + item.poster_path
            : item.poster || "/assets/placeholder.jpg",
          backdrop: item.backdrop_path
            ? "https://image.tmdb.org/t/p/original" + item.backdrop_path
            : "",
          description: item.overview || "",
          rating: item.vote_average,
          genres: item.genre_ids || [],
          original_language: item.original_language,
          id: item.id,
          category: genre?.name || null,
        };
      })
      .filter(
        m =>
          m.description &&
          m.description.length > 30 &&
          m.backdrop &&
          m.poster
      );
  }

  // Memo hóa uniqueMovies để tránh tính lại mỗi render
  const uniqueMovies = useMemo(() => {
    return Array.from(new Map(markSource(movies).map(m => [m.id, m])).values());
  }, [movies, genres]);

  // Memo hóa featuredMovies
  const featuredMovies = useMemo(() => uniqueMovies.slice(0, 6), [uniqueMovies]);

  // Memo hóa phim Việt đã chuẩn hóa
  const uniqueVietMovies = useMemo(() => {
    return Array.from(new Map(markSource(vietMovies).map(m => [m.id, m])).values()).slice(0, 12);
  }, [vietMovies, genres]);

  // Các phim khác
  const featuredMovie = featuredMovies[currentHeroIndex];
  const featuredIDs = new Set(featuredMovies.map(m => m.id));
  const gridMovies = uniqueMovies.filter(m => !featuredIDs.has(m.id));

  useEffect(() => {
    if (!featuredMovies.length) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % featuredMovies.length);
    }, 30000);
    return () => clearInterval(autoSlideRef.current);
  }, [featuredMovies.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-yellow-500/20 blur-3xl animate-ping"></div>
        <img
          src={logo}
          alt="PN Movie"
          className="w-24 h-24 object-contain animate__animated animate__pulse animate__infinite"
        />
        <div className="text-xl mt-6 tracking-wide font-semibold animate__animated animate__fadeIn">
          Đang tải tất cả phim...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f1b] min-h-screen text-white">
      {featuredMovie && (
        <div className="relative">
          <HeroBannerContainer movie={featuredMovie} />
          <div className="absolute z-20 flex gap-2 right-8 top-[75%]">
            {featuredMovies.map((m, idx) => (
              <button
                key={idx}
                className={`w-14 h-8 border-2 rounded-full overflow-hidden transition-all duration-300 ${
                  idx === currentHeroIndex
                    ? "border-yellow-500 scale-110"
                    : "border-gray-600 opacity-60 hover:opacity-100"
                }`}
                onClick={() => setCurrentHeroIndex(idx)}
              >
                <img
                  src={m.poster}
                  alt="thumb"
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      <CategorySection />

      <MovieSectionSlider
        title="Phim mới cập nhật"
        movies={uniqueMovies.slice(6, 18)}
        genresList={genres}
      />

      <MovieSectionSlider
        title="IMDb cao nhất"
        movies={[...uniqueMovies].sort((a, b) => b.rating - a.rating).slice(0, 12)}
        genresList={genres}
      />

      <AnimeSpotlightSection animeList={uniqueMovies.filter(m => m.genre_ids.includes(16)).slice(0, 14)} />

      <MovieSectionSlider
        title="Phim Việt Nam"
        movies={uniqueVietMovies}
        genresList={genres}
      />

      <MovieSectionSlider
        title="Phim Hàn Quốc"
        movies={uniqueMovies.filter(m => m.original_language === "ko").slice(0, 12)}
        genresList={genres}
      />

      {gridMovies.length === 0 && !loading && (
        <div className="text-center text-gray-400 my-20">
          Không tìm thấy phim nào để hiển thị.
        </div>
      )}
    </div>
  );
}
