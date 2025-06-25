import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import HeroBannerContainer from "../components/HeroBannerContainer";
import CategorySection from "../components/CategorySection";
import MovieSectionSlider from "../components/MovieSectionSlider";
import logo from "../assets/logo.png";

const MAX_PAGE = 2; // Giảm số trang lấy cho nhanh demo

export default function CountryPage() {
  const { id } = useParams(); // Mã quốc gia
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Các nhóm phim
  const [moviesByCountry, setMoviesByCountry] = useState([]);
  const [moviesAction, setMoviesAction] = useState([]);
  const [moviesComedy, setMoviesComedy] = useState([]);
  const [moviesRecent, setMoviesRecent] = useState([]);

  // Hero Banner
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const autoSlideRef = useRef();

  // Lấy danh sách genres TMDb
  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await axios.get("http://localhost:5000/api/tmdb/genres");
        setGenres(res.data.genres || []);
      } catch {
        setGenres([]);
      }
    }
    fetchGenres();
  }, []);

  // Hàm fetch phim theo param
  async function fetchMovies(params, setMovies) {
    try {
      let allResults = [];
      for (let p = 1; p <= MAX_PAGE; p++) {
        const res = await axios.get("http://localhost:5000/api/tmdb/discover", {
          params: {
            ...params,
            page: p,
            language: "vi-VN",
          },
        });
        allResults = allResults.concat(res.data.results || []);
      }
      setMovies(allResults);
    } catch {
      setMovies([]);
    }
  }

  // Fetch nhiều nhóm phim khi id thay đổi
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // Fetch phim theo quốc gia
    fetchMovies({ with_origin_country: id }, setMoviesByCountry);

    // Phim hành động (genreId = 28), có quốc gia
    fetchMovies({ with_genres: 28, with_origin_country: id }, setMoviesAction);

    // Phim hài (genreId = 35), có quốc gia
    fetchMovies({ with_genres: 35, with_origin_country: id }, setMoviesComedy);

    // Phim mới: sắp xếp theo ngày phát hành gần nhất (sort_by = 'release_date.desc')
    fetchMovies(
      { with_origin_country: id, sort_by: "release_date.desc" },
      setMoviesRecent
    );

    // Tắt loading sau 3s (hoặc bạn có thể tinh chỉnh logic loading thực tế)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id]);

  // Map dữ liệu raw TMDb sang format dùng trong app
  function markSource(list) {
    return list
      .map((item) => {
        const genreId = item.genre_ids?.[0];
        const genre = genres.find((g) => g.id === genreId);
        return {
          ...item,
          name: item.title || item.name || "Không rõ tên",
          year:
            (item.release_date || item.first_air_date || "").split("-")[0] ||
            "N/A",
          poster: item.poster_path
            ? "https://image.tmdb.org/t/p/w500" + item.poster_path
            : null,
          backdrop: item.backdrop_path
            ? "https://image.tmdb.org/t/p/original" + item.backdrop_path
            : null,
          description:
            item.overview && item.overview.trim() !== ""
              ? item.overview
              : "Không có mô tả cho phim này.",
          rating: item.vote_average || 0,
          genres: item.genre_ids || [],
          id: item.id,
          category: genre?.name || null,
        };
      })
      .filter((m) => m.poster && m.backdrop);
  }

  // Dữ liệu đã xử lý
  const countryMovies = useMemo(() => markSource(moviesByCountry), [moviesByCountry, genres]);
  const actionMovies = useMemo(() => markSource(moviesAction), [moviesAction, genres]);
  const comedyMovies = useMemo(() => markSource(moviesComedy), [moviesComedy, genres]);
  const recentMovies = useMemo(() => markSource(moviesRecent), [moviesRecent, genres]);

  // Hero banner chọn từ phim quốc gia
  const featuredMovies = useMemo(() => countryMovies.slice(0, 6), [countryMovies]);
  const featuredItem = featuredMovies[currentHeroIndex];

  // Auto slide hero banner 30s
  useEffect(() => {
    if (!featuredMovies.length) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % featuredMovies.length);
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
          Đang tải phim theo quốc gia...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f1b] min-h-screen text-white">
      {featuredItem && (
        <div className="relative">
          <HeroBannerContainer movie={featuredItem} />
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

      {/* Hiển thị nhiều slider */}
      <MovieSectionSlider
        title={`Phim quốc gia: ${id}`}
        movies={countryMovies}
        genresList={genres}
      />

      <MovieSectionSlider
        title="Phim hành động"
        movies={actionMovies}
        genresList={genres}
      />

      <MovieSectionSlider
        title="Phim hài"
        movies={comedyMovies}
        genresList={genres}
      />

      <MovieSectionSlider
        title="Phim mới"
        movies={recentMovies}
        genresList={genres}
      />
    </div>
  );
}
