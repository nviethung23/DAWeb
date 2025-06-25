import axios from "axios";

const API_KEY = "beede3bb5fc88310916252b96f99062a"; // Thay bằng API key TMDB của bạn

export async function fetchVietMovies() {
  try {
    const res = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=vi&page=1`
    );
    return res.data.results || [];
  } catch (error) {
    console.error("Lỗi fetch phim Việt:", error);
    return [];
  }
}
