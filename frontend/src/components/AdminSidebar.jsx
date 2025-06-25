import React from "react";
import { Link } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <aside className="w-60 bg-gray-900 text-white h-full p-6 rounded-xl shadow-lg">
      <h2 className="font-bold text-lg mb-6">Quản trị DAWEB</h2>
      <nav className="flex flex-col gap-3">
        <Link to="/admin" className="hover:underline">Quản lý phim riêng</Link>
        <Link to="/" className="hover:underline">Trang chủ</Link>
      </nav>
    </aside>
  );
}
