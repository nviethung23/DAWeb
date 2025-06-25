// src/hooks/useFavoriteMovies.js
import { useAuth } from "../context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = ""; // Nếu dùng proxy Vite thì giữ trống, nếu không thì điền http://localhost:5000

export function useFavoriteMovies() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách yêu thích
  useEffect(() => {
    if (!user?.token) {
      setFavoriteIds([]);
      return;
    }
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/favorite`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        if (res.data?.movies)
          setFavoriteIds(
            res.data.movies.map((m) => ({
              id: String(m.id),
              source: "tmdb", // Mặc định hết là tmdb
            }))
          );
        else setFavoriteIds([]);
      })
      .catch(() => {
        setFavoriteIds([]);
      })
      .finally(() => setLoading(false));
  }, [user?.token]);

  // Thêm yêu thích (luôn là tmdb)
  const addFavorite = useCallback(
    async (movieId) => {
      if (!user?.token) return false;
      setLoading(true);
      try {
        await axios.post(
          `${BASE_URL}/api/favorite`,
          { movie_id: String(movieId), source: "tmdb" },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setFavoriteIds((ids) => [...ids, { id: String(movieId), source: "tmdb" }]);
        return true;
      } catch {
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.token]
  );

  // Xoá yêu thích
  const removeFavorite = useCallback(
    async (movieId) => {
      if (!user?.token) return false;
      setLoading(true);
      try {
        await axios.delete(`${BASE_URL}/api/favorite`, {
          headers: { Authorization: `Bearer ${user.token}` },
          data: { movie_id: String(movieId), source: "tmdb" },
        });
        setFavoriteIds((ids) =>
          ids.filter((item) => item.id !== String(movieId))
        );
        return true;
      } catch {
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.token]
  );

  // Kiểm tra có phải yêu thích không
  const isFavorite = useCallback(
    (movieId) =>
      favoriteIds.some((item) => item.id === String(movieId) && item.source === "tmdb"),
    [favoriteIds]
  );

  return { isFavorite, addFavorite, removeFavorite, favoriteIds, loading };
}
