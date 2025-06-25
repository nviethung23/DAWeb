import React from "react";

const categories = [
  { name: "Siêu anh hùng", color: "from-indigo-500 to-violet-600" },
  { name: "Phù Thuỷ", color: "from-pink-500 to-yellow-500" },
  { name: "Cổ Trang", color: "from-green-500 to-teal-400" },
  { name: "Chiến tranh", color: "from-red-500 to-orange-500" },
  { name: "Hay nhức nách", color: "from-blue-500 to-cyan-500" },
  { name: "Chữa lành", color: "from-amber-500 to-lime-400" },
];

export default function CategorySection() {
  return (
    <section className="py-10 px-4 max-w-screen-xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-7 text-white drop-shadow">
        Bạn đang quan tâm gì?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((c, i) => (
          <div
            key={c.name}
            className={`rounded-2xl p-6 min-h-[120px] flex flex-col justify-center items-center cursor-pointer 
              font-bold text-lg md:text-xl text-white shadow-xl hover:scale-105 hover:shadow-2xl transition
              bg-gradient-to-br ${c.color}`}
          >
            <span className="mb-1">{c.name}</span>
            <span className="text-xs text-white/80">Xem chủ đề &rarr;</span>
          </div>
        ))}
      </div>
    </section>
  );
}
