import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import posterlogin from "../assets/posterlogin.png";
import logologin from "../assets/logologin.png";
import toast from "react-hot-toast";

export default function LoginModal({ show, onClose, onShowRegister,onShowForgot }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.success) {
      toast.success("Đăng nhập thành công!", {
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #22c55e",
        },
        iconTheme: {
          primary: "#22c55e",
          secondary: "#1e293b",
        },
      });
      onClose();
      navigate(res.role === "admin" ? "/admin" : "/");
    } else {
      toast.error("Tài khoản hoặc mật khẩu sai!", {
        style: {
          background: "#1e293b",
          color: "#fff",
          border: "1px solid #facc15",
        },
        iconTheme: {
          primary: "#facc15",
          secondary: "#1e293b",
        },
      });
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="w-full max-w-6xl min-h-[600px] bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-fadeIn"
      >
        {/* Bên trái - ảnh poster và logo */}
        <div
          className="relative w-full md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: `url(${posterlogin})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10 flex flex-col justify-center items-center h-full p-8 text-white">
            {/* Thêm mô tả/giới thiệu nếu muốn */}
          </div>
          {/* Logo ở góc dưới bên trái */}
          <div className="absolute bottom-4 left-4 z-20">
            <img src={logologin} alt="Logo" className="w-24 drop-shadow-xl" />
          </div>
        </div>

        {/* Bên phải - form */}
        <form
          onSubmit={handleSubmit}
          className="w-full md:w-1/2 p-8 bg-[#1e293b] text-white relative"
        >
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-white text-xl hover:text-yellow-400"
          >
            ✕
          </button>
           <div className="mt-16">
          <h2 className="text-2xl font-bold mb-2">Đăng nhập</h2>
          <p className="mb-6 text-sm text-white/70">
            Nếu bạn chưa có tài khoản,{" "}
            <Link
            to="#"
            onClick={e => {
              e.preventDefault();
              if (onShowRegister) onShowRegister();
            }}
            className="text-yellow-400 hover:underline"
          >
            đăng ký ngay
          </Link>
            
          </p>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm text-white/70">Tên đăng nhập</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm text-white/70">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className="mt-4 text-right text-sm">
            <button
            type="button"
            onClick={onShowForgot}
            className="text-white/60 hover:text-yellow-400 underline"
          >
            Quên mật khẩu?
          </button>

          </div>
        </form>
      </div>
    </div>
  );
}
