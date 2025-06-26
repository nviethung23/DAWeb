// src/components/AdminSidebar.jsx
import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Film, Layers, Menu, Home, LogOut } from "lucide-react";

const adminLinks = [
  { path: "/admin/user", label: "Quản lý Users", icon: <User size={20} /> },
  { path: "/admin/movies", label: "Quản lý Phim", icon: <Film size={20} /> },
  { path: "/admin/category", label: "Quản lý Thể loại", icon: <Layers size={20} /> },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  if (!user || user.role !== "admin") return null;

  // Sidebar content (dùng lại cho cả dạng trượt và cố định)
  const sidebarContent = (
    <div className="h-full flex flex-col py-8 px-4 w-[230px] bg-[#121218] border-r-2 border-yellow-400 shadow-2xl">
      <div className="mb-12 flex items-center gap-3">
        <span className="text-3xl font-extrabold text-yellow-400 tracking-wide">ADMIN</span>
      </div>
      <nav className="flex flex-col gap-4 flex-1">
        {adminLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setOpen(false)} // Đóng sidebar khi chọn link (trên mobile)
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-base transition-all
              ${location.pathname.startsWith(item.path)
                ? "bg-yellow-400 text-black shadow"
                : "bg-[#191922] text-yellow-400 hover:bg-yellow-500 hover:text-black"}
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div
        className="relative mt-auto flex items-center gap-3 bg-[#18181f] px-3 py-3 rounded-xl text-yellow-400 cursor-pointer select-none"
        tabIndex={0}
        onClick={() => setShowMenu(m => !m)}
        onBlur={() => setShowMenu(false)}
        ref={menuRef}
      >
        <User size={18} />
        <span className="truncate">{user.displayName || user.username}</span>
        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-0 bottom-14 w-48 bg-[#23232a] rounded-xl shadow-lg py-2 z-50 border border-yellow-400 animate-fadeIn">
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-white hover:bg-yellow-400 hover:text-black transition rounded-xl"
              onMouseDown={() => {
                setShowMenu(false);
                navigate("/");
              }}
            >
              <Home size={18} /> Trang chủ
            </button>
            <button
              className="w-full flex items-center gap-2 px-4 py-2 text-left text-white hover:bg-yellow-400 hover:text-black transition rounded-xl"
              onMouseDown={() => {
                setShowMenu(false);
                logout();
                navigate("/");
              }}
            >
              <LogOut size={18} /> Đăng xuất
            </button>
          </div>
        )}
        <style>
          {`
            @keyframes fadeIn { from {opacity: 0; transform: translateY(15px);} to {opacity: 1; transform: none;} }
            .animate-fadeIn { animation: fadeIn 0.17s ease; }
          `}
        </style>
      </div>
    </div>
  );

  return (
    <>
      {/* Hamburger (nút 3 sọc) chỉ hiện trên mobile & tablet */}
      <button
        className="fixed top-5 left-5 z-[100] md:hidden bg-[#191922] rounded-full p-2 shadow-lg border-2 border-yellow-400"
        onClick={() => setOpen(true)}
        aria-label="Open admin sidebar"
      >
        <Menu size={28} className="text-yellow-400" />
      </button>

      {/* Sidebar cố định trên màn hình lớn */}
      <aside className="hidden md:block fixed top-0 left-0 h-screen z-40">
        {sidebarContent}
      </aside>

      {/* Sidebar dạng trượt (cho mobile, tablet) */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Sidebar trượt ra từ trái */}
          <aside
            className={`
              fixed top-0 left-0 z-[100] h-full w-[230px] bg-[#121218] border-r-2 border-yellow-400 shadow-2xl
              animate-slideIn
            `}
            style={{ animation: "slideIn 0.28s cubic-bezier(0.4,0.1,0.4,1)" }}
          >
            {sidebarContent}
          </aside>
          <style>
            {`
              @keyframes slideIn {
                from { transform: translateX(-110%);}
                to { transform: translateX(0);}
              }
              .animate-slideIn { animation: slideIn 0.28s cubic-bezier(0.4,0.1,0.4,1); }
            `}
          </style>
        </>
      )}
    </>
  );
}
