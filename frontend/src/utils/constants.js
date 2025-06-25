// src/utils/constants.js
export const sortOptions = [
  { label: "Mới nhất", value: "release_date.desc" },
  { label: "Cũ nhất", value: "release_date.asc" },
  { label: "IMDb cao nhất", value: "vote_average.desc" },
  { label: "Lượt xem nhiều", value: "popularity.desc" }
];

export const years = Array.from({ length: 25 }, (_, i) => (new Date().getFullYear() - i).toString());

export const ageRatings = [
  { value: "", label: "Tất cả độ tuổi" },
  { value: "G", label: "G - Mọi lứa tuổi" },
  { value: "PG", label: "PG - Có thể cần hướng dẫn" },
  { value: "PG-13", label: "PG-13 - Trẻ dưới 13 cần hướng dẫn" },
  { value: "R", label: "R - Trẻ dưới 17 cần người lớn" },
  { value: "NC-17", label: "NC-17 - 17+ tuổi" }
];
