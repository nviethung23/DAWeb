import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex bg-black min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-[230px] p-4 md:p-8">
        <Outlet />
      </div>
    </div>
  );
}
