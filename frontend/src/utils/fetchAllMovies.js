// src/utils/fetchAllMovies.js
import axios from "axios";

const TOTAL_PAGES = 20; // hoặc 500 nếu cần

export async function fetchAllMovies() {
  const requests = [];
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    requests.push(axios.get(`http://localhost:5000/api/tmdb/popular?page=${i}`));
  }
  const results = await Promise.all(requests);
  let allMovies = [];
  results.forEach(res => {
    if (res.data && res.data.results) {
      allMovies = allMovies.concat(res.data.results);
    }
  });
  return allMovies;
}
