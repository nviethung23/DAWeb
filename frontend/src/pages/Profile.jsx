import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import avatar1 from "../assets/userslogo/1.png";
import avatar2 from "../assets/userslogo/2.png";
import avatar3 from "../assets/userslogo/3.png";
import avatar4 from "../assets/userslogo/4.png";
import avatar5 from "../assets/userslogo/5.png";
import avatar6 from "../assets/userslogo/6.png";

const AVATAR_LIST = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6];

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [avatar, setAvatar] = useState(user.avatar || AVATAR_LIST[0]);
  const [gender, setGender] = useState(user.gender || "other");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  try {
    const result = await updateProfile({ displayName, avatar, gender });
    if (result?.success) {
      toast.success("Cập nhật thành công!");
    } else if (result?.error) {
      toast.error("Cập nhật thất bại: " + result.error);
    } else {
      toast.success("Cập nhật thành công!"); // fallback
    }
  } catch (err) {
    toast.error("Có lỗi xảy ra: " + (err?.message || "Không xác định"));
  }
  setLoading(false);
}
  return (
    <div className="flex flex-col md:flex-row justify-center items-start gap-10 py-12 px-4 md:px-10 min-h-screen bg-[#191B22] pt-60 ">
      {/* Sidebar */}
      <div className="w-full md:w-[340px] bg-[#23242b] rounded-2xl shadow-lg p-8 mb-8 md:mb-0">
        <h2 className="text-xl font-bold mb-8 text-white">Quản lý tài khoản</h2>
        <nav className="flex flex-col gap-2 text-white/90">
          <a href="#" className="flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-[#1c1e2b]">
            <button
            onClick={() => navigate("/favorites")}
            className="flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-[#1c1e2b] w-full text-left"
          >
            <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c2.14 0 4.09 1.13 5.19 2.84C13.41 4.13 15.36 3 17.5 3 20.58 3 23 5.42 23 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Yêu thích
          </button>
          </a>
          <a href="#" className="flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-[#1c1e2b]">
            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 4V12L16 14" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Danh sách
          </a>
          <a href="#" className="flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-[#1c1e2b]">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Xem tiếp
          </a>
          <a href="#" className="flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-[#1c1e2b] font-semibold text-yellow-400">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
            </svg>
            Tài khoản
          </a>
        </nav>
        {/* User Info and Logout */}
        <div className="flex flex-col items-center mt-10">
          <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full border-2 border-white mb-2 object-cover" />
          <div className="font-semibold text-white">{displayName || user.username}</div>
          <div className="text-xs text-white/60">{user.email}</div>
          <button
            onClick={() => { logout(); navigate("/"); }} 
            className="mt-4 flex items-center gap-2 text-white/90 hover:text-red-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12H7" />
            </svg>
            Thoát
          </button>
        </div>
      </div>
      {/* Form chính */}
      <form
        className="flex-1 max-w-2xl bg-[#22232b] rounded-2xl shadow-lg p-10 md:p-12 relative text-white"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold mb-6">Tài khoản</h1>
        <div className="mb-5">
          <label className="block mb-1 text-sm">Email</label>
          <input
            value={user.email}
            className="w-full px-4 py-2 rounded bg-[#181923] border border-[#24263b] text-white/80"
            disabled
            readOnly
          />
        </div>
        <div className="mb-5">
          <label className="block mb-1 text-sm">Tên hiển thị</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 rounded bg-[#181923] border border-[#24263b] text-white"
            required
          />
        </div>
        <div className="mb-5">
          <label className="block mb-1 text-sm">Giới tính</label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="male"
                checked={gender === "male"}
                onChange={() => setGender("male")}
              />
              Nam
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="female"
                checked={gender === "female"}
                onChange={() => setGender("female")}
              />
              Nữ
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="other"
                checked={gender === "other"}
                onChange={() => setGender("other")}
              />
              Không xác định
            </label>
          </div>
        </div>
        {/* Chọn avatar */}
        <div className="mb-8">
          <label className="block mb-1 text-sm">Đổi ảnh đại diện</label>
          <div className="flex gap-3 mt-2 flex-wrap">
            {AVATAR_LIST.map((a, idx) => (
              <img
                key={a}
                src={a}
                alt={`avatar-${idx}`}
                className={`w-14 h-14 rounded-full cursor-pointer object-cover border-2 transition ${
                  avatar === a ? "border-yellow-400 ring-2 ring-yellow-300" : "border-transparent"
                }`}
                onClick={() => setAvatar(a)}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-yellow-400 text-black px-8 py-2 rounded font-semibold hover:bg-yellow-300 transition"
          disabled={loading}
        >
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
        <div className="mt-8 text-sm text-white/70">
          Đổi mật khẩu, nhấn vào{" "}
          <a href="#" className="text-yellow-400 hover:underline">
            đây
          </a>
        </div>
      </form>
    </div>
  );
}
