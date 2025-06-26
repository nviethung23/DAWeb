import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";  // <-- Đã sửa chỗ này!

export default function AdminCategory() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (user === null) return; // Chờ AuthContext khởi tạo
    if (!user || user.role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này!");
      navigate("/");
    }
    // eslint-disable-next-line
  }, [user, navigate]);

  // Chỉ gọi API khi user là admin
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchCategories();
    }
    // eslint-disable-next-line
  }, [user]);

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/categories`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCategories(res.data.categories || []);
    } catch {
      toast.error("Không tải được danh sách thể loại");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!user || !user.token) {
      toast.error("Phiên đăng nhập hết hạn!");
      return;
    }
    if (!newCategory.trim()) return toast.error("Nhập tên thể loại!");
    try {
      setLoading(true);
      await axios.post(`${API_BASE}/categories`, { name: newCategory }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNewCategory("");
      toast.success("Đã thêm thể loại!");
      fetchCategories();
    } catch (err) {
      toast.error("Lỗi thêm thể loại!");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(id) {
    if (!user || !user.token) {
      toast.error("Phiên đăng nhập hết hạn!");
      return;
    }
    if (!editName.trim()) return toast.error("Tên không được để trống!");
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/categories/${id}`, { name: editName }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEditId(null);
      setEditName("");
      toast.success("Đã sửa!");
      fetchCategories();
    } catch {
      toast.error("Lỗi sửa!");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!user || !user.token) {
      toast.error("Phiên đăng nhập hết hạn!");
      return;
    }
    if (!window.confirm("Xác nhận xoá thể loại này?")) return;
    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/categories/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success("Đã xoá!");
      fetchCategories();
    } catch {
      toast.error("Lỗi xoá!");
    } finally {
      setLoading(false);
    }
  }

  // Loading khi chưa xác thực xong
  if (user === null) {
    return (
      <div className="text-yellow-400 text-xl font-bold text-center py-16">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Layers size={32} className="text-yellow-400" />
        <h1 className="text-3xl font-bold text-yellow-400">Quản lý Thể loại</h1>
      </div>

      {/* Thêm mới thể loại */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Tên thể loại mới..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 px-4 py-2 rounded-l-xl bg-[#1b1b22] text-white border border-yellow-400 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded-r-xl transition flex items-center gap-2 shadow"
        >
          <Plus size={20} /> Thêm
        </button>
      </form>

      {/* Bảng thể loại */}
      <div className="bg-[#18181f] rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full text-white">
          <thead>
            <tr className="bg-[#23232a]">
              <th className="p-3 border-b border-yellow-400 text-left">#</th>
              <th className="p-3 border-b border-yellow-400 text-left">Tên thể loại</th>
              <th className="p-3 border-b border-yellow-400"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, idx) => (
              <tr
                key={cat.id || cat._id}
                className="hover:bg-[#29293c] transition"
              >
                <td className="p-3 border-b border-[#24243a]">{idx + 1}</td>
                <td className="p-3 border-b border-[#24243a]">
                  {editId === (cat.id || cat._id) ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="px-3 py-1 rounded bg-[#23232a] text-white border border-yellow-400 outline-none"
                      autoFocus
                    />
                  ) : (
                    <span>{cat.name}</span>
                  )}
                </td>
                <td className="p-3 border-b border-[#24243a]">
                  {editId === (cat.id || cat._id) ? (
                    <>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 mr-2"
                        onClick={() => handleEdit(cat.id || cat._id)}
                        disabled={loading}
                      >
                        Lưu
                      </button>
                      <button
                        className="bg-gray-500 hover:bg-gray-600 text-white rounded px-3 py-1"
                        onClick={() => { setEditId(null); setEditName(""); }}
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-yellow-400 hover:bg-yellow-500 text-black rounded px-3 py-1 mr-2 flex items-center gap-1"
                        onClick={() => { setEditId(cat.id || cat._id); setEditName(cat.name); }}
                        disabled={loading}
                      >
                        <Edit size={16} /> Sửa
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1 flex items-center gap-1"
                        onClick={() => handleDelete(cat.id || cat._id)}
                        disabled={loading}
                      >
                        <Trash2 size={16} /> Xoá
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-400">
                  Không có thể loại nào!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
