import React, { useEffect, useState } from "react";


export default function ReviewList({ movieId }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      try {
        const [summaryRes, reviewsRes] = await Promise.all([
          fetch(`/api/reviews/${movieId}/summary`),
          fetch(`/api/reviews/${movieId}`),
        ]);
        const summaryData = await summaryRes.json();
        const reviewsData = await reviewsRes.json();
        setSummary({
          avgRating: summaryData.avgRating || 0,
          count: summaryData.count || 0,
        });
        setReviews(reviewsData.reviews || []);
      } catch (error) {
        console.error("Lỗi khi tải đánh giá:", error);
        setSummary({ avgRating: 0, count: 0 });
        setReviews([]);
      } finally {
        setLoading(false);
      }
    }
    if (movieId) fetchReviews();
  }, [movieId]);

  if (loading) return <p>Đang tải đánh giá...</p>;

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-2">Đánh giá phim</h3>
      <div className="mb-4">
        <strong>{summary.avgRating.toFixed(1)} / 5</strong> từ {summary.count} đánh giá
      </div>
      {reviews.length === 0 && <p>Chưa có đánh giá nào.</p>}
      <ul className="space-y-4 max-h-[400px] overflow-y-auto">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="border rounded p-3 bg-gray-800 text-white"
          >
            <div className="flex justify-between mb-1">
              <span className="font-semibold">{r.username || "Ẩn danh"}</span>
              <span>{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            <div className="mb-1">Điểm: {r.rating} / 5</div>
            <div className="whitespace-pre-wrap">{r.comment}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
