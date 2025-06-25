import React from "react";
import logo from "../assets/logo.png"; // PNG hoặc SVG logo của bạn

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Vòng tròn ánh sáng */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-yellow-500/20 blur-3xl animate-ping"></div>

      {/* Logo với hiệu ứng gõ chữ hoặc lướt sáng */}
      <div className="z-10 flex flex-col items-center gap-6 animate__animated animate__fadeIn">
        <img
          src={logo}
          alt="PN Movie"
          className="w-24 h-24 object-contain animate__animated animate__pulse animate__infinite"
        />
        <div className="text-2xl font-semibold text-white tracking-widest relative">
          <span className="relative z-10">Đang tải phim...</span>
          <span className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-yellow-400 via-white to-yellow-400 animate-loading-shine bg-clip-text text-transparent"></span>
        </div>
      </div>

      <style>
        {`
          @keyframes loading-shine {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
          .animate-loading-shine {
            animation: loading-shine 1.8s linear infinite;
          }
        `}
      </style>
    </div>
  );
}
