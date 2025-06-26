import React, { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import posterlogin from "../assets/posterlogin.png";
import logologin from "../assets/logologin.png";

export default function ForgotPasswordModal({ show, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    }
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  useEffect(() => {
    if (show) {
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPw("");
    }
  }, [show]);

  // Bước 1: Gửi OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email.trim()) return toast.error("Vui lòng nhập email!");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/request-otp", { email });
      toast.success("Đã gửi mã xác thực về email!");
      setStep(2);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Không gửi được mã, thử lại!"
      );
    } finally {
      setLoading(false);
    }
  }

  // Bước 2: Xác thực OTP & đổi mật khẩu
  async function handleResetPw(e) {
    e.preventDefault();
    if (!otp.trim() || !newPw.trim()) {
      toast.error("Nhập đủ mã xác thực và mật khẩu mới!");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/verify-otp-reset", {
        email, otp, new_password: newPw,
      });
      toast.success("Đổi mật khẩu thành công!");
      setEmail(""); setOtp(""); setNewPw("");
      setStep(1);
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Đổi mật khẩu thất bại!"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="w-full max-w-6xl min-h-[600px] bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-fadeIn"
      >
      
        <div
          className="relative w-full md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: `url(${posterlogin})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10 flex flex-col justify-center items-center h-full p-8 text-white"></div>
          <div className="absolute bottom-4 left-4 z-20">
            <img src={logologin} alt="Logo" className="w-24 drop-shadow-xl" />
          </div>
        </div>

        {/* Bên phải - form forgot password */}
        <form
          onSubmit={step === 1 ? handleSendOtp : handleResetPw}
          className="w-full md:w-1/2 p-8 bg-[#1e293b] text-white relative flex flex-col justify-center"
        >
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 text-white text-xl hover:text-yellow-400"
          >
            ✕
          </button>
          <div className="mt-2">
            <h2 className="text-2xl font-bold mb-2">Quên mật khẩu</h2>
            <p className="mb-6 text-sm text-white/70">
              Vui lòng nhập email đã đăng ký để nhận mã xác thực đổi mật khẩu.
            </p>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm text-white/70">
              Email đăng ký tài khoản
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              type="email"
              className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
              disabled={step === 2}
              autoFocus
            />
          </div>

          {/* Bước 2: Nhập OTP và mật khẩu mới */}
          {step === 2 && (
            <>
              <div className="mb-4">
                <label className="block mb-1 text-sm text-white/70">
                  Mã xác thực (OTP) gửi về email
                </label>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Nhập mã xác thực"
                  maxLength={6}
                  className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block mb-1 text-sm text-white/70">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-4 py-2 rounded bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-500 transition"
          >
            {loading
              ? step === 1
                ? "Đang gửi mã..."
                : "Đang đổi mật khẩu..."
              : step === 1
                ? "Gửi mã xác thực"
                : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
