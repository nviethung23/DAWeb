import axios from "axios";
const API_BASE = "http://localhost:5000/api/tmdb";

// Lấy danh sách thể loại phim (genres) từ backend
export const fetchGenres = () =>
  axios
    .get(`${API_BASE}/genres`)
    .then(res => res.data.genres);

// Lấy danh sách ngôn ngữ từ backend
export const fetchLanguages = () =>
  axios
    .get(`${API_BASE}/configuration/languages`)
    .then(res => res.data);

// Lấy danh sách quốc gia từ backend
export const fetchCountries = () =>
  axios
    .get(`${API_BASE}/configuration/countries`)
    .then(res => res.data);

// Độ tuổi: (vẫn là list thủ công)
export const ageRatings = [
  { value: "", label: "Tất cả độ tuổi" },
  { value: "G", label: "G - Mọi lứa tuổi" },
  { value: "PG", label: "PG - Có thể cần hướng dẫn" },
  { value: "PG-13", label: "PG-13 - Trẻ dưới 13 cần hướng dẫn" },
  { value: "R", label: "R - Trẻ dưới 17 cần người lớn" },
  { value: "NC-17", label: "NC-17 - 17+ tuổi" }
];
