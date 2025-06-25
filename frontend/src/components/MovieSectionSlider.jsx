import React, { useRef, useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import MovieCardPopup from "./MovieCardPopup";
import { ChevronLeft, ChevronRight } from "lucide-react";

const POPUP_WIDTH = 420;
const POPUP_HEIGHT = 520;
const GAP = 8;
const POPUP_DELAY = 300; // giảm delay để popup hiện nhanh hơn

export default function MovieSectionSlider({ title, movies, genresList }) {
  const sliderRef = useRef();
  const [popupInfo, setPopupInfo] = useState({ movie: null, pos: null });

  const showPopupTimerRef = useRef(null);
  const isMouseOverPopupRef = useRef(false);

  // Ẩn popup khi scroll hoặc wheel trên slider
  useEffect(() => {
    const sliderEl = sliderRef.current;
    if (!sliderEl) return;

    function handleWheel() {
      if (popupInfo.movie) {
        setPopupInfo({ movie: null, pos: null });
      }
    }

    sliderEl.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      sliderEl.removeEventListener("wheel", handleWheel);
    };
  }, [popupInfo.movie]);

  // Ẩn popup khi scroll window
  useEffect(() => {
    function handleScroll() {
      setPopupInfo({ movie: null, pos: null });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hàm scroll slider trái/phải
  function scrollSlider(direction) {
    if (!sliderRef.current) return;
    const { offsetWidth, scrollLeft } = sliderRef.current;
    const scrollAmount = Math.round(offsetWidth * 0.75);
    sliderRef.current.scrollTo({
      left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  }

  // Khi hover card: delay hiện popup, tính vị trí popup chuẩn với scroll
  function handleCardMouseEnter(movie, cardRef) {
    if (showPopupTimerRef.current) clearTimeout(showPopupTimerRef.current);

    showPopupTimerRef.current = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        let targetX = rect.left + scrollX + rect.width / 2 - POPUP_WIDTH / 2;
        let targetY = rect.top + scrollY + rect.height / 2 - POPUP_HEIGHT / 2;

        targetX = Math.max(GAP + scrollX, Math.min(targetX, scrollX + window.innerWidth - POPUP_WIDTH - GAP));
        targetY = Math.max(GAP + scrollY, Math.min(targetY, scrollY + window.innerHeight - POPUP_HEIGHT - GAP));

        setPopupInfo({
          movie,
          pos: { x: targetX, y: targetY, w: POPUP_WIDTH, h: POPUP_HEIGHT },
        });
      }
      showPopupTimerRef.current = null;
    }, POPUP_DELAY);
  }

  // Khi rời card: delay ẩn popup nếu không hover popup
  function handleCardMouseLeave() {
    if (showPopupTimerRef.current) clearTimeout(showPopupTimerRef.current);

    setTimeout(() => {
      if (!isMouseOverPopupRef.current) {
        setPopupInfo({ movie: null, pos: null });
      }
    }, 150); // delay tăng để tránh nhấp nháy popup
  }

  // Khi hover popup: giữ popup
  function handlePopupMouseEnter() {
    isMouseOverPopupRef.current = true;
    if (showPopupTimerRef.current) clearTimeout(showPopupTimerRef.current);
  }

  // Khi rời popup: ẩn popup
  function handlePopupMouseLeave() {
    isMouseOverPopupRef.current = false;
    setPopupInfo({ movie: null, pos: null });
  }

  return (
    <section className="py-8 px-4 max-w-screen-xl mx-auto">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scrollSlider("left")}
              className="rounded-full bg-white/10 hover:bg-yellow-400 hover:text-black text-white w-10 h-10 flex items-center justify-center transition"
              aria-label="Scroll left"
              type="button"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => scrollSlider("right")}
              className="rounded-full bg-white/10 hover:bg-yellow-400 hover:text-black text-white w-10 h-10 flex items-center justify-center transition"
              aria-label="Scroll right"
              type="button"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
      <div
        ref={sliderRef}
        className="flex gap-6 pb-2 scroll-smooth relative overflow-x-auto no-scrollbar"
        style={{ scrollBehavior: "smooth" }}
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onHover={handleCardMouseEnter}
            onLeave={handleCardMouseLeave}
          />
        ))}
        {popupInfo.movie && (
          <MovieCardPopup
            movie={popupInfo.movie}
            pos={popupInfo.pos}
            genresList={genresList}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          />
        )}
      </div>
    </section>
  );
}
