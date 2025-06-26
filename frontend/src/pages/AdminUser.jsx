import React, { useEffect, useState } from "react";
import axios from "axios";
import { darkSelectStyles } from "../layouts/darkSelectStyles";
import Select from "react-select";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:5000/api";

const roleOptions = [
  { value: "admin", label: "Quản trị viên" },
  { value: "user", label: "Người dùng" },
];

export default function UserAdmin() {
  const { user } = useAuth();
  const token = user?.token;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchUsers();
    document.body.style.background = "#0a0a0f";
    return () => { document.body.style.background = ""; };
    // eslint-disable-next-line
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch {
      alert("Lỗi tải user!");
    } finally {
      setLoading(false);
    }
  }

  function openEdit(u) {
    setEditUser(u);
    setRole(roleOptions.find((r) => r.value === (u.role || "user")));
  }

  async function handleRoleChange() {
    if (!editUser || !role) return;
    try {
      setLoading(true);
      const res = await axios.patch(
        `${API_BASE}/users/${editUser.username}/role`,
        { role: role.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Đã đổi quyền");
      setEditUser(null);
      setRole(null);
      fetchUsers();
    } catch {
      alert("Không đổi được quyền!");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(username) {
    if (!window.confirm("Xác nhận xoá user này?")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch {
      alert("Lỗi xoá user!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-32 min-h-screen w-full px-0 md:px-4 bg-[#0a0a0f] text-white">
      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#181825] px-12 py-8 rounded-2xl shadow-2xl text-lg font-semibold text-yellow-400 flex items-center gap-2">
            <svg className="animate-spin w-7 h-7 mr-3 text-yellow-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg>
            Đang xử lý...
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-yellow-400 tracking-wide text-center">Quản lý tài khoản</h1>
        <div className="overflow-x-auto rounded-2xl shadow-2xl border border-[#222229] mb-10 bg-[#17171f]/90 backdrop-blur">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-[#191920] text-yellow-400">
                <th className="p-3 border border-[#232332]">Avatar</th>
                <th className="p-3 border border-[#232332]">Username</th>
                <th className="p-3 border border-[#232332]">Email</th>
                <th className="p-3 border border-[#232332]">Role</th>
                <th className="p-3 border border-[#232332]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.username} className="border-b border-[#232332] hover:bg-[#22222a]/80 transition group">
                  <td className="p-2 border border-[#232332]">
                    <img
                      src={u.avatar || "/no-image.png"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover shadow"
                      loading="lazy"
                    />
                  </td>
                  <td className="p-2 border border-[#232332] font-bold">{u.username}</td>
                  <td className="p-2 border border-[#232332]">{u.email}</td>
                  <td className="p-2 border border-[#232332]">
                    <span className={`font-semibold px-2 py-1 rounded-lg ${u.role === "admin"
                      ? "bg-pink-800/60 text-pink-300"
                      : "bg-blue-900/50 text-blue-300"
                      }`}>
                      {u.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </span>
                  </td>
                  <td className="p-2 border border-[#232332] space-x-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-1 rounded-xl shadow"
                    >
                      Đổi quyền
                    </button>
                    <button
                      onClick={() => handleDelete(u.username)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold px-4 py-1 rounded-xl shadow"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Popup đổi quyền */}
        {editUser && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl shadow-2xl bg-[#191a21] border border-[#23252d] p-8 relative">
              <button
                type="button"
                onClick={() => {
                  setEditUser(null); setRole(null);
                }}
                className="absolute top-4 right-6 text-gray-400 hover:text-red-400 text-2xl font-bold"
                aria-label="Đóng"
                title="Đóng"
              >×</button>
              <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Đổi quyền user</h2>
              <div className="flex flex-col gap-4 items-center">
                <div className="text-lg font-semibold">{editUser.username}</div>
                <Select
                  styles={darkSelectStyles}
                  options={roleOptions}
                  value={role}
                  onChange={setRole}
                  className="w-full"
                />
                <button
                  onClick={handleRoleChange}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl shadow-xl mt-4"
                  disabled={!role}
                >Cập nhật quyền</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
