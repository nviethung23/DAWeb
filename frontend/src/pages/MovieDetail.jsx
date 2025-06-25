import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MovieCardPopup from "../components/MovieCardPopup";

// Tabs UI
function Tabs({ currentTab, setTab }) {
  const tabs = [
    { key: "gallery", label: "Gallery" },
    { key: "actors", label: "Diễn viên" },
    { key: "suggested", label: "Đề xuất" },
    { key: "similar", label: "Tương tự" }
  ];
  return (
    <div className="flex mb-4 border-b border-gray-800">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          className={`px-6 py-2 font-semibold transition-all text-lg
            ${currentTab === t.key
              ? "border-b-4 border-yellow-400 text-yellow-400"
              : "text-gray-300 hover:text-yellow-400"}
          `}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Actors Grid (với navigate click ảnh diễn viên)
function ActorsGrid({ actors }) {
  const navigate = useNavigate();

  if (!actors || actors.length === 0)
    return <div className="text-gray-400 text-center py-6">Không có dữ liệu diễn viên.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {actors.map((a, i) => (
        <div
          key={i}
          className="flex items-center gap-3 bg-[#23252d] p-2 rounded-xl w-full cursor-pointer hover:bg-[#353641] transition"
          onClick={() => navigate(`/actors/${a.id}`)} // CHỈNH: /actors/:id đúng với route App.jsx
        >
          <img
            src={a.avatar || a.image || "/no-image.png"}
            alt={a.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold text-white">{a.name}</div>
            {a.role && <div className="text-xs text-gray-400">{a.role}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
// Gallery component
function Gallery({ images, keywords, showMore, setShowMore }) {
  const MAX_IMAGES = 6;
  const navigate = useNavigate();
  const visibleImages = showMore ? images : images.slice(0, MAX_IMAGES);

  return (
    <>
      <div className="mb-4">
        <div className="bg-[#21222b] rounded-xl p-3 flex flex-wrap gap-2 items-center">
          <span className="font-bold text-yellow-400 text-base">Từ khóa:</span>
          {(!keywords || keywords.length === 0) ? (
            <span className="text-gray-400">Không có</span>
          ) : (
            keywords.map((kw) => (
              <button
                key={kw.id}
                className="px-2 py-1 bg-[#191a21] text-white rounded-full text-xs font-medium hover:bg-yellow-500 hover:text-black transition"
                onClick={() => navigate(`/search?keyword=${encodeURIComponent(kw.name)}`)}
              >
                {kw.name}
              </button>
            ))
          )}
        </div>
      </div>
      {(!images || images.length === 0) ? (
        <div className="text-gray-400 text-center py-6">Chưa có hình ảnh gallery.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {visibleImages.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={img.caption || ""}
                className="rounded-xl object-cover w-full h-40"
              />
            ))}
          </div>
          {images.length > MAX_IMAGES && (
            <div className="flex justify-center mt-4">
              <button
                className="px-5 py-2 bg-[#23232a] rounded-xl text-yellow-400 font-bold hover:bg-[#323241] transition"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Ẩn bớt" : "Xem thêm"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// MovieList with popup hover like Home/Favorites
function MovieList({ list, showMore, setShowMore }) {
  const MAX_MOVIES = 6;
  const navigate = useNavigate();
  const visibleList = showMore ? list : list.slice(0, MAX_MOVIES);

  const [popup, setPopup] = useState(null);
  const popupTimer = useRef();
  const closeTimer = useRef();

  function handleMovieHover(movie, cardRef) {
    clearTimeout(popupTimer.current);
    clearTimeout(closeTimer.current);
    popupTimer.current = setTimeout(() => {
      if (!cardRef?.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const headerHeight = 64;
      const popupWidth = Math.max(rect.width + 40, 340);
      let left = rect.left + window.scrollX - (popupWidth - rect.width) / 2;
      let top = rect.top + window.scrollY - 12;
      left = Math.max(8, Math.min(left, window.innerWidth - popupWidth - 8));
      if (top < headerHeight + 8) top = headerHeight + 8;
      setPopup({
        movie,
        pos: {
          x: left,
          y: top,
          w: popupWidth,
        },
      });
    }, 400);
  }

  function handleMovieLeave() {
    clearTimeout(popupTimer.current);
    closeTimer.current = setTimeout(() => {
      setPopup(null);
    }, 240);
  }

  function handlePopupEnter() {
    clearTimeout(closeTimer.current);
  }

  function handlePopupLeave() {
    setPopup(null);
  }

  if (!list || list.length === 0)
    return <div className="text-gray-400 text-center py-6">Không có dữ liệu phim.</div>;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 relative z-10">
        {visibleList.map((movie, i) => {
          const cardRef = React.createRef();
          return (
            <button
              key={i}
              ref={cardRef}
              className="flex items-center gap-3 bg-[#23252d] p-2 rounded-xl w-full hover:bg-[#353641] transition text-left relative"
              onClick={() => navigate(`/movie/${movie.id || movie.tmdb_id}`)}
              onMouseEnter={() => handleMovieHover(movie, cardRef)}
              onMouseLeave={handleMovieLeave}
            >
              <img
                src={movie.poster}
                alt={movie.name}
                className="w-14 h-20 rounded-lg object-cover"
              />
              <div>
                <div className="font-semibold text-white">{movie.name}</div>
                {movie.year && <div className="text-xs text-gray-400">{movie.year}</div>}
              </div>
            </button>
          );
        })}
        {popup && (
          <MovieCardPopup
            movie={popup.movie}
            pos={popup.pos}
            onMouseEnter={handlePopupEnter}
            onMouseLeave={handlePopupLeave}
          />
        )}
      </div>
      {list.length > MAX_MOVIES && (
        <div className="flex justify-center mt-4">
          <button
            className="px-5 py-2 bg-[#23232a] rounded-xl text-yellow-400 font-bold hover:bg-[#323241] transition"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? "Ẩn bớt" : "Xem thêm"}
          </button>
        </div>
      )}
    </>
  );
}

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState({});
  const [tab, setTab] = useState("gallery");
  const [loading, setLoading] = useState(true);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [galleryArr, setGalleryArr] = useState([]);
  const [keywordsArr, setKeywordsArr] = useState([]);
  const [suggestedArr, setSuggestedArr] = useState([]);
  const [similarArr, setSimilarArr] = useState([]);
  const [showMoreGallery, setShowMoreGallery] = useState(false);
  const [showMoreSuggested, setShowMoreSuggested] = useState(false);
  const [showMoreSimilar, setShowMoreSimilar] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let found = null;
      setShowMoreGallery(false);
      setShowMoreSuggested(false);
      setShowMoreSimilar(false);

      try {
        // --- Backend (nếu có) ---
        if (/^\d+$/.test(id) && Number(id) < 1e9) {
          try {
            const backendRes = await axios.get(`http://localhost:5000/api/movies/${id}`);
            if (backendRes.data && backendRes.data.success && backendRes.data.movie) {
              found = backendRes.data.movie;
            }
          } catch {}
        }
        if (!found) {
          try {
            const backendRes = await axios.get(`http://localhost:5000/api/movies`);
            const moviesArr = Array.isArray(backendRes.data.movies)
              ? backendRes.data.movies
              : [];
            found = moviesArr.find(m => String(m.id) === String(id));
          } catch {}
        }
        if (found) {
          let actorsArr = [];
          if (Array.isArray(found.actors) && found.actors.length > 0 && typeof found.actors[0] === "object") {
            actorsArr = found.actors.slice(0, 8).map(a => ({
              id: a.id,
              name: a.name,
              avatar: a.avatar || "/no-image.png",
              role: a.role || "",
            }));
          } else if (typeof found.actors === "string") {
            actorsArr = found.actors.split(",").slice(0, 8).map(name => ({
              id: null,
              name: name.trim(),
              avatar: "/no-image.png",
              role: "",
            }));
          }
          setMovie({
            ...found,
            from: "backend",
            director: found.director || "",
            description: found.description || "",
            actorsArr,
          });
          setTrailerUrl(found.trailer || "");
          setGalleryArr(found.galleryArr || []);
          setKeywordsArr(found.keywordsArr || []);
          setSuggestedArr(found.suggestedArr || []);
          setSimilarArr(found.similarArr || []);
          setLoading(false);
          return;
        }
        // --- TMDB ---
        const tmdbRes = await axios.get(`http://localhost:5000/api/tmdb/movie/${id}`);
        const m = tmdbRes.data;
        let banner = m.backdrop_path
          ? "https://image.tmdb.org/t/p/original" + m.backdrop_path
          : m.poster_path
          ? "https://image.tmdb.org/t/p/w1280" + m.poster_path
          : "";
        let director = "";
        let actorsArr = [];
        try {
          const creditsRes = await axios.get(`http://localhost:5000/api/tmdb/movie/${id}/credits`);
          const credits = creditsRes.data;
          director = credits.crew?.find(c => c.job === "Director")?.name || "";
          actorsArr = (credits.cast || []).slice(0, 8).map(a => ({
            id: a.id,
            name: a.name,
            avatar: a.profile_path
              ? "https://image.tmdb.org/t/p/w185" + a.profile_path
              : "/no-image.png",
            role: a.character || "",
          }));
        } catch {}
        setMovie({
          ...m,
          from: "tmdb",
          name: m.title || m.name,
          year: (m.release_date || m.first_air_date || "").split("-")[0],
          poster: m.poster_path
            ? "https://image.tmdb.org/t/p/w500" + m.poster_path
            : "/no-image.png",
          banner,
          description: m.overview || "",
          genres: m.genres?.map(g => g.name).join(", "),
          rating: m.vote_average,
          country: Array.isArray(m.production_countries)
            ? m.production_countries.map(c => c.name).join(", ")
            : m.origin_country || "",
          director,
          actorsArr,
        });

        try {
          const videoRes = await axios.get(`http://localhost:5000/api/tmdb/movie/${id}/videos`);
          const trailer = videoRes.data.results?.find(
            v => v.site === "YouTube" && v.type === "Trailer"
          ) || videoRes.data.results?.find(
            v => v.site === "YouTube"
          );
          if (trailer) {
            setTrailerUrl("https://www.youtube.com/embed/" + trailer.key);
          }
        } catch {}

        try {
          const imgRes = await axios.get(`http://localhost:5000/api/tmdb/movie/${id}/images`);
          const posters = (imgRes.data.posters || []).map(x => ({
            url: "https://image.tmdb.org/t/p/w500" + x.file_path,
            caption: "Poster"
          }));
          const backdrops = (imgRes.data.backdrops || []).map(x => ({
            url: "https://image.tmdb.org/t/p/w780" + x.file_path,
            caption: "Backdrop"
          }));
          setGalleryArr([...posters, ...backdrops]);
        } catch {
          setGalleryArr([]);
        }

        try {
          const kwRes = await axios.get(`http://localhost:5000/api/tmdb/movie/${id}/keywords`);
          setKeywordsArr(kwRes.data.keywords || []);
        } catch {
          setKeywordsArr([]);
        }

        try {
          const recRes = await axios.get(`http://localhost:5000/api/tmdb/movie/${id}/recommendations`);
          setSuggestedArr(
            (recRes.data.results || []).map(item => ({
              id: item.id,
              tmdb_id: item.id,
              name: item.title,
              poster: item.poster_path
                ? "https://image.tmdb.org/t/p/w185" + item.poster_path
                : "/no-image.png",
              year: (item.release_date || "").split("-")[0]
            }))
          );
        } catch {
          setSuggestedArr([]);
        }

        try {
          const simRes = await axios.get(`http://localhost:5000/api/tmdb/movie/${id}/similar`);
          setSimilarArr(
            (simRes.data.results || []).map(item => ({
              id: item.id,
              tmdb_id: item.id,
              name: item.title,
              poster: item.poster_path
                ? "https://image.tmdb.org/t/p/w185" + item.poster_path
                : "/no-image.png",
              year: (item.release_date || "").split("-")[0]
            }))
          );
        } catch {
          setSimilarArr([]);
        }
      } catch {
        setMovie({});
        setGalleryArr([]);
        setKeywordsArr([]);
        setSuggestedArr([]);
        setSimilarArr([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  function renderTabContent() {
    if (tab === "actors") return <ActorsGrid actors={movie.actorsArr} />;
    if (tab === "gallery")
      return (
        <Gallery
          images={galleryArr}
          keywords={keywordsArr}
          showMore={showMoreGallery}
          setShowMore={setShowMoreGallery}
        />
      );
    if (tab === "suggested")
      return (
        <MovieList
          list={suggestedArr}
          showMore={showMoreSuggested}
          setShowMore={setShowMoreSuggested}
        />
      );
    if (tab === "similar")
      return (
        <MovieList
          list={similarArr}
          showMore={showMoreSimilar}
          setShowMore={setShowMoreSimilar}
        />
      );
    return null;
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl font-bold">Đang tải thông tin phim...</div>
      </div>
    );

  return (
    <div className="bg-black min-h-screen pb-10">
      {/* Banner */}
      <div className="relative h-[280px] md:h-[350px] w-full">
        {movie.banner && (
          <img
            src={movie.banner}
            alt="banner"
            className="absolute w-full h-full object-cover brightness-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/90"></div>
        <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white opacity-90 drop-shadow-lg">{movie.name}</h1>
        </div>
      </div>

      {/* Content: poster + mô tả + tabs */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 px-2 mt-[-10px] relative z-10">
        {/* Poster + thông tin phụ */}
        <div className="w-full md:w-[320px] flex flex-col items-center md:items-start">
          <div className="w-full bg-[#23232a] rounded-2xl shadow-2xl p-4 flex flex-col items-center">
            <img
              src={movie.poster}
              alt={movie.name}
              className="w-48 h-72 rounded-xl object-cover shadow-lg border-4 border-[#23232a] mb-4"
            />
            <div className="w-full text-base text-white px-1">
              {movie.year && (
                <div>
                  <span className="font-bold text-gray-200">Năm:</span>{" "}
                  <span className="font-semibold">{movie.year}</span>
                </div>
              )}
              {movie.genres && (
                <div>
                  <span className="font-bold text-gray-200">Thể loại:</span>{" "}
                  <span>{movie.genres}</span>
                </div>
              )}
              {movie.country && (
                <div>
                  <span className="font-bold text-gray-200">Quốc gia:</span>{" "}
                  <span>{movie.country}</span>
                </div>
              )}
              {movie.rating && (
                <div>
                  <span className="font-bold text-gray-200">Đánh giá:</span>{" "}
                  <span className="font-bold text-yellow-300">{movie.rating.toFixed(1)}/10</span>
                </div>
              )}
              {movie.director && (
                <div>
                  <span className="font-bold text-gray-200">Đạo diễn:</span>{" "}
                  <span>{movie.director}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs + mô tả */}
        <div className="flex-1">
          <Tabs currentTab={tab} setTab={setTab} />
          <div className="bg-[#191a21] rounded-2xl shadow-lg p-5">
            {/* Mô tả */}
            <div className="mb-7">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">Mô tả</div>
              <div className="text-gray-200 text-base leading-relaxed">{movie.description}</div>
            </div>
            {/* Nội dung tab */}
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Trailer */}
      {trailerUrl && (
        <div className="max-w-5xl mx-auto mt-10 px-2">
          <div className="text-4xl font-extrabold text-white mb-4 text-center">Trailer</div>
          <div className="w-full relative pb-[56.25%] h-0 rounded-lg overflow-hidden bg-black shadow-xl">
            <iframe
              src={trailerUrl}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              title="Trailer"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
