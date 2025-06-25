import axios from "axios";

const API_KEY = "beede3bb5fc88310916252b96f99062a";
const API_BASE = "http://localhost:5000/api/tmdb";

export async function getGenres() {
  const res = await axios.get(`${API_BASE}/genres`);
  return res.data.genres || [];
}

export async function getCountries() {
  const res = await axios.get(`${API_BASE}/countries`);
  return res.data.countries || [];
}

export async function getPopularMovies(page = 1) {
  const res = await axios.get(`${API_BASE}/popular?page=${page}`);
  return res.data.results || [];
}

export async function getTopRatedMovies() {
  const res = await axios.get(`${API_BASE}/top-rated`);
  return res.data.results || [];
}

export async function getMovieDetail(id) {
  const res = await axios.get(`${API_BASE}/movie/${id}`);
  return res.data;
}

export async function getMovieVideos(id) {
  const res = await axios.get(`${API_BASE}/movie/${id}/videos`);
  return res.data.results || [];
}


export async function searchMovies(query) {
  const res = await axios.get(`${API_BASE}/search?query=${query}`);
  return res.data.results || [];
}

export async function getPopularActors() {
  const res = await axios.get(`${API_BASE}/actors`);
  return res.data.results || [];
}


// services/tmdbService.js
export async function discoverMoviesByGenre(genreId, filter = {}, page = 1) {
  // Mặc định sắp xếp theo độ phổ biến nếu chưa chọn gì
  const params = {
    language: "vi-VN",
    sort_by: filter.sort || "popularity.desc",
    page
  };

  // Chỉ truyền with_genres nếu chọn genre thực sự
  if (genreId && genreId !== "" && genreId !== "all") params.with_genres = genreId;

  if (filter.country && filter.country !== "") {
    params.region = filter.country; // Vẫn giữ region (nhiều API dùng cho sort theo quốc gia)
    params.with_origin_country = filter.country; // Bắt buộc: LỌC PHIM SẢN XUẤT tại quốc gia này
  }

  if (filter.year && filter.year !== "") params.primary_release_year = filter.year;

  let certificationCountry = filter.country;
  if (filter.age && (!certificationCountry || certificationCountry === "")) {
    certificationCountry = "US";
  }
  if (filter.age && filter.age !== "") params.certification = filter.age;
  
  if (filter.age && certificationCountry && filter.age !== "" && certificationCountry !== "")
    params.certification_country = certificationCountry;


  // Loại bỏ mọi key có giá trị rỗng, null hoặc "all"
  Object.keys(params).forEach(key => {
    if (
      params[key] === undefined ||
      params[key] === null ||
      params[key] === "" ||
      params[key] === "all"
    ) {
      delete params[key];
    }
  });

  // --- DEBUG: Xem params gửi backend ---

  // Gọi API Flask
  const res = await axios.get("http://localhost:5000/api/tmdb/discover", { params });
  return {
    results: res.data.results || [],
    total_pages: res.data.total_pages || 1
  };
}

