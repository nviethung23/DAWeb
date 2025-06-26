// src/hooks/useWatchLaterMovies.js
import { useAuth } from "../context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = ""; // Nếu dùng proxy Vite thì giữ trống, nếu không thì điền http://localhost:5000

export function useWatchLaterMovies() {
  const { user } = useAuth();
  const [watchLaterIds, setWatchLaterIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.token) {
      setWatchLaterIds([]);
      return;
    }
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/watchlater`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        if (res.data?.movies)
          setWatchLaterIds(
            res.data.movies.map((m) => ({
              id: String(m.id),
              source: m.source || "local", // ưu tiên source backend trả về
            }))
          );
        else setWatchLaterIds([]);
      })
      .catch(() => {
        setWatchLaterIds([]);
      })
      .finally(() => setLoading(false));
  }, [user?.token]);

  const addWatchLater = useCallback(
    async (movieId) => {
      if (!user?.token) return false;
      setLoading(true);
      try {
        await axios.post(
          `${BASE_URL}/api/watchlater`,
          { movie_id: String(movieId), source: "local" }, // đồng bộ với backend mặc định
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setWatchLaterIds((ids) => [...ids, { id: String(movieId), source: "local" }]);
        return true;
      } catch {
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.token]
  );

  const removeWatchLater = useCallback(
    async (movieId) => {
      if (!user?.token) return false;
      setLoading(true);
      try {
        await axios.delete(`${BASE_URL}/api/watchlater`, {
          headers: { Authorization: `Bearer ${user.token}` },
          data: { movie_id: String(movieId), source: "local" },
        });
        setWatchLaterIds((ids) =>
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

  const isWatchLater = useCallback(
    (movieId) =>
      watchLaterIds.some((item) => item.id === String(movieId) && item.source === "local"),
    [watchLaterIds]
  );

  return {
    isWatchLater,
    addWatchLater,
    removeWatchLater,
    watchLaterIds,
    loading,
  };
}
