import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import HeroBannerContainer from "../components/HeroBannerContainer";
import CategorySection from "../components/CategorySection";
import AnimeSpotlightSection from "../components/AnimeSpotlightSection";
import MovieSectionSlider from "../components/MovieSectionSlider";
import logo from "../assets/logo.png";

const API_KEY = "beede3bb5fc88310916252b96f99062a"; // Thay bằng API TMDB key của bạn
const MAX_PAGE = 3;

export default function SeriesPage() {
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [onTheAir, setOnTheAir] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const autoSlideRef = useRef();

  // Lấy genres
  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=vi-VN`
        );
        setGenres(res.data.genres || []);
      } catch {
        setGenres([]);
      }
    }
    fetchGenres();
  }, []);

  // Hàm gọi API lấy nhiều trang cho từng loại series
  async function fetchSeriesType(url, setState) {
    try {
      let results = [];
      for (let p = 1; p <= MAX_PAGE; p++) {
        const res = await axios.get(`${url}&page=${p}`);
        results = results.concat(res.data.results || []);
      }
      setState(results);
    } catch {
      setState([]);
    }
  }

  // Load dữ liệu 3 loại series
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchSeriesType(
        `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=vi-VN`,
        setPopular
      ),
      fetchSeriesType(
        `https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&language=vi-VN`,
        setTopRated
      ),
      fetchSeriesType(
        `https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}&language=vi-VN`,
        setOnTheAir
      ),
    ]).finally(() => setLoading(false));
  }, []);

  // Chuẩn hóa & lọc dữ liệu
  function markSource(list) {
    return list
      .map(item => {
        const genreId = item.genre_ids?.[0];
        const genre = genres.find(g => g.id === genreId);
        return {
          ...item,
          name: item.name || item.title || "Không rõ tên",
          year: (item.first_air_date || item.release_date || "").split("-")[0] || "N/A",
          poster: item.poster_path
            ? "https://image.tmdb.org/t/p/w500" + item.poster_path
            : null,
          backdrop: item.backdrop_path
            ? "https://image.tmdb.org/t/p/original" + item.backdrop_path
            : null,
          description: item.overview && item.overview.trim() !== ""
            ? item.overview
            : "Không có mô tả cho phim này.",
          rating: item.vote_average || 0,
          genres: item.genre_ids || [],
          id: item.id,
          category: genre?.name || null,
        };
      })
      .filter(m => m.poster && m.backdrop);
  }

  // Memos chuẩn hóa từng loại
  const uniquePopular = useMemo(() => {
    return Array.from(new Map(markSource(popular).map(m => [m.id, m])).values());
  }, [popular, genres]);

  const uniqueTopRated = useMemo(() => {
    return Array.from(new Map(markSource(topRated).map(m => [m.id, m])).values());
  }, [topRated, genres]);

  const uniqueOnTheAir = useMemo(() => {
    return Array.from(new Map(markSource(onTheAir).map(m => [m.id, m])).values());
  }, [onTheAir, genres]);

  // Hero banner lấy 6 phim phổ biến đầu tiên
  const featuredSeries = useMemo(() => uniquePopular.slice(0, 6), [uniquePopular]);
  const featuredItem = featuredSeries[currentHeroIndex];

  // Slide hero banner tự động
  useEffect(() => {
    if (!featuredSeries.length) return;
    autoSlideRef.current = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % featuredSeries.length);
    }, 30000);
    return () => clearInterval(autoSlideRef.current);
  }, [featuredSeries.length]);

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
          Đang tải danh sách series...
        </div>
      </div>
    );
  }

  // Loại ra các phim trong hero khỏi danh sách phổ biến để tránh trùng
  const featuredIDs = new Set(featuredSeries.map(m => m.id));
  const filteredPopular = uniquePopular.filter(m => !featuredIDs.has(m.id));

  return (
    <div className="bg-[#0f0f1b] min-h-screen text-white">
      {/* Hero banner */}
      {featuredItem && (
        <div className="relative">
          <HeroBannerContainer movie={featuredItem} />
          <div className="absolute z-20 flex gap-2 right-8 top-[75%]">
            {featuredSeries.map((m, idx) => (
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

      {/* Series phổ biến */}
      <MovieSectionSlider
        title="Series Phổ biến"
        movies={filteredPopular}
        genresList={genres}
      />

      {/* Top rated */}
      <MovieSectionSlider
        title="Top Rated Series"
        movies={uniqueTopRated}
        genresList={genres}
      />

      {/* Series đang phát */}
      <MovieSectionSlider
        title="Series Đang Phát"
        movies={uniqueOnTheAir}
        genresList={genres}
      />

      {/* Anime spotlight */}
      <AnimeSpotlightSection
        animeList={uniquePopular.filter(m => m.genres.includes(16)).slice(0, 14)}
      />
    </div>
  );
}
