import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiFilter } from "react-icons/bi";

export default function MovieAdvancedFilterBar({
  genres = [],
  filter,
  onChange,
  activeGenreId
}) {
  const [showFilter, setShowFilter] = useState(false);
  const [tempFilter, setTempFilter] = useState(filter);
  const navigate = useNavigate();
  const location = useLocation();

  // Xử lý thay đổi filter tạm thời
  function handleTempChange(e) {
    const { name, value } = e.target;
    setTempFilter(prev => ({
      ...prev,
      [name]: value === "" ? "" : value // Rõ ràng
    }));
  }

  // Áp dụng filter: chỉ truyền những field có value thực sự
  function handleApplyFilter() {
    // Tạo filter mới, xóa các field rỗng hoặc "all"
    const cleanFilter = {};
    Object.entries(tempFilter).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== "all") cleanFilter[k] = v;
    });
    onChange(cleanFilter);
    setShowFilter(false);

    // Force reload filter (navigate đến chính mình)
    navigate(location.pathname, { replace: true });
  }

  function handleGenreChange(e) {
  const value = e.target.value;
  if (!value) {
    // Chỉ update filter, KHÔNG chuyển route, KHÔNG truyền param genre lên API
    onChange(prev => ({
      ...prev,
      genre: ""
    }));
  } else {
    navigate(`/genres/${value}`);
  }
}


  function handleToggleFilter() {
    setShowFilter(!showFilter);
    setTempFilter(filter); // Mỗi lần mở filter lại load theo filter thực tế
  }

  return (
    <div className="relative mb-8">
      <button
        onClick={handleToggleFilter}
        className="bg-yellow-600 text-white rounded-full p-2 shadow hover:bg-yellow-700 transition flex items-center"
        title="Bộ lọc nâng cao"
      >
        <BiFilter size={28} />
      </button>
      {showFilter && (
        <div className="absolute z-30 bg-[#181827] text-white w-full rounded-xl shadow-lg p-6 mt-3 border border-[#2a2a3a]">
          {/* Thể loại */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-semibold min-w-[70px]">Thể loại:</span>
            <select
              className="rounded px-3 py-2 bg-[#222] text-white"
              value={activeGenreId || ""}
              onChange={handleGenreChange}
            >
              <option value="">Tất cả</option>
              {genres.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          {/* Quốc gia */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-semibold min-w-[70px]">Quốc gia:</span>
            <select className="rounded px-3 py-2 bg-[#222] text-white" name="country" value={tempFilter.country || ""} onChange={handleTempChange}>
              <option value="">Tất cả</option>
              <option value="VN">Việt Nam</option>
              <option value="US">Mỹ</option>
              <option value="KR">Hàn Quốc</option>
              <option value="JP">Nhật Bản</option>
            </select>
          </div>
          {/* Độ tuổi */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-semibold min-w-[70px]">Độ tuổi:</span>
            <select className="rounded px-3 py-2 bg-[#222] text-white" name="age" value={tempFilter.age || ""} onChange={handleTempChange}>
              <option value="">Tất cả</option>
              <option value="G">G - Mọi lứa tuổi</option>
              <option value="PG">PG - Có thể cần hướng dẫn</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
              <option value="NC-17">NC-17</option>
            </select>
          </div>
          {/* Năm sản xuất */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-semibold min-w-[120px]">Năm sản xuất:</span>
            <select className="rounded px-3 py-2 bg-[#222] text-white" name="year" value={tempFilter.year || ""} onChange={handleTempChange}>
              <option value="">Tất cả</option>
              {Array.from({ length: 30 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
          {/* Sắp xếp */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="font-semibold min-w-[70px]">Sắp xếp:</span>
            <select className="rounded px-3 py-2 bg-[#222] text-white" name="sort" value={tempFilter.sort || ""} onChange={handleTempChange}>
              <option value="release_date.desc">Mới nhất</option>
              <option value="release_date.asc">Cũ nhất</option>
              <option value="vote_average.desc">IMDb cao nhất</option>
              <option value="popularity.desc">Lượt xem nhiều</option>
            </select>
          </div>
          {/* Nút Lọc */}
          <div className="flex gap-3 mt-4">
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-5 py-2 rounded-lg transition"
              onClick={handleApplyFilter}
            >
              Lọc kết quả
            </button>
            <button
              className="border border-gray-400 px-5 py-2 rounded-lg hover:bg-gray-600 transition"
              onClick={() => setShowFilter(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
