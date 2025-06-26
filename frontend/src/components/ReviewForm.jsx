import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function ReviewForm({ movieId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const getToken = () => user?.token || localStorage.getItem("token");

  function handleRatingChange(value) {
    // Chỉ nhận số hợp lệ từ 0.5 -> 5, bội số của 0.5
    let num = Number(value);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 5) num = 5;
    // Làm tròn về bội số 0.5
    num = Math.round(num * 2) / 2;
    setRating(num);
  }

  async function submitReview() {
    if (rating < 0.5 || rating > 5) {
      toast.error("Vui lòng chọn điểm từ 0.5 đến 5.0.");
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Bạn cần đăng nhập để gửi đánh giá.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movie_id: movieId, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        setRating(0);
        setComment("");
        onReviewSubmitted && onReviewSubmitted();
      } else {
        toast.error(data.message || "Lỗi gửi đánh giá.");
      }
    } catch (e) {
      toast.error("Lỗi gửi đánh giá.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-2">Viết đánh giá</h3>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Điểm đánh giá</label>
        <div className="flex items-center gap-4">
          {/* Thanh trượt (slider) */}
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={rating}
            onChange={(e) => handleRatingChange(e.target.value)}
            disabled={loading}
            className="w-48 accent-yellow-400"
          />
          {/* Nhập số thập phân */}
          <input
            type="number"
            min={0.5}
            max={5}
            step={0.5}
            value={rating}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-20 px-2 py-1 rounded bg-gray-700 text-white"
            disabled={loading}
          />
          <span className="text-gray-300 text-sm">/ 5</span>
        </div>
      </div>
      <div className="mb-3">
        <label className="block mb-1 font-medium">Bình luận</label>
        <textarea
          className="w-full px-3 py-2 rounded bg-gray-700 text-white resize-none"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Viết cảm nhận của bạn..."
          disabled={loading}
        />
      </div>
      <button
        className="px-6 py-2 rounded bg-yellow-500 font-semibold text-black hover:bg-yellow-600 transition"
        onClick={submitReview}
        disabled={loading}
      >
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </div>
  );
}
