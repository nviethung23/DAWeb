import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Film, Layers } from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [counts, setCounts] = useState({ users: 0, movies: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nếu chưa đăng nhập hoặc không phải admin thì về trang chủ
    if (!user || user.role !== "admin") {
      navigate("/");
    } else {
      fetchCounts();
    }
    // eslint-disable-next-line
  }, [user]);

  async function fetchCounts() {
    try {
      setLoading(true);
      // User & Category thường cần xác thực, Movie thì tuỳ API backend
      const [usersRes, moviesRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE}/users`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        axios.get(`${API_BASE}/movies`),
        axios.get(`${API_BASE}/categories`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
      ]);
      setCounts({
        users: usersRes.data.users?.length || 0,
        movies: moviesRes.data.movies?.length || 0,
        categories: categoriesRes.data.categories?.length || 0,
      });
    } catch (err) {
      toast.error("Không thể tải dữ liệu thống kê!");
      setCounts({ users: 0, movies: 0, categories: 0 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
          Bảng Điều Khiển Quản Trị
        </h1>
        <div className="text-gray-300 mb-4">
          Xin chào{" "}
          <span className="font-bold">
            {user?.displayName || user?.username}
          </span>
          !
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Users */}
        <div className="bg-[#18181f] rounded-2xl shadow-lg flex items-center p-7 border-l-8 border-yellow-400 hover:scale-105 transition">
          <User size={44} className="text-yellow-400 mr-5" />
          <div>
            <div className="text-3xl font-extrabold text-white">
              {loading ? "..." : counts.users}
            </div>
            <div className="text-lg font-bold text-yellow-400">Người dùng</div>
          </div>
        </div>
        {/* Card Movies */}
        <div className="bg-[#18181f] rounded-2xl shadow-lg flex items-center p-7 border-l-8 border-yellow-400 hover:scale-105 transition">
          <Film size={44} className="text-yellow-400 mr-5" />
          <div>
            <div className="text-3xl font-extrabold text-white">
              {loading ? "..." : counts.movies}
            </div>
            <div className="text-lg font-bold text-yellow-400">Phim</div>
          </div>
        </div>
        {/* Card Categories */}
        <div className="bg-[#18181f] rounded-2xl shadow-lg flex items-center p-7 border-l-8 border-yellow-400 hover:scale-105 transition">
          <Layers size={44} className="text-yellow-400 mr-5" />
          <div>
            <div className="text-3xl font-extrabold text-white">
              {loading ? "..." : counts.categories}
            </div>
            <div className="text-lg font-bold text-yellow-400">Thể loại</div>
          </div>
        </div>
      </div>

      {/* Các nút truy cập nhanh */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        <button
          onClick={() => navigate("/admin/user")}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl px-7 py-4 shadow-xl text-lg transition"
        >
          Quản lý Users
        </button>
        <button
          onClick={() => navigate("/admin/movies")}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl px-7 py-4 shadow-xl text-lg transition"
        >
          Quản lý Phim
        </button>
        <button
          onClick={() => navigate("/admin/category")}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl px-7 py-4 shadow-xl text-lg transition"
        >
          Quản lý Thể loại
        </button>
      </div>
    </div>
  );
}
