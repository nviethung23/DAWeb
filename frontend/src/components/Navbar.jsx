import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { getGenres, getCountries } from "../services/tmdbService";
import { useAuth } from "../context/AuthContext";
import user1 from "../assets/userslogo/1.png";
import user2 from "../assets/userslogo/2.png";
import user3 from "../assets/userslogo/3.png";
import user4 from "../assets/userslogo/4.png";
import user5 from "../assets/userslogo/5.png";
import user6 from "../assets/userslogo/6.png";
const USER_AVATAR_LIST = [user1, user2, user3, user4, user5, user6];

function getRandomAvatar(username) {
  let sum = 0;
  for (let i = 0; i < username.length; i++) sum += username.charCodeAt(i);
  return USER_AVATAR_LIST[sum % USER_AVATAR_LIST.length];
}

export default function Navbar({ onLoginClick }) {
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isGenreOpen, setGenreOpen] = useState(false);
  const [isCountryOpen, setCountryOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const genreDropdownRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const dropdownRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getGenres().then(setGenres).catch(() => setGenres([]));
    getCountries().then(setCountries).catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (isGenreOpen && genreDropdownRef.current && !genreDropdownRef.current.contains(e.target)) {
        setGenreOpen(false);
      }
      if (isCountryOpen && countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setCountryOpen(false);
      }
      if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isGenreOpen, isCountryOpen, showDropdown]);

  function handleLogout() {
    logout();
    setShowDropdown(false);
    navigate("/");
  }

  // Ưu tiên displayName, nếu không sẽ lấy username/email
const displayName = user?.displayName?.trim() ? user.displayName : (user?.username || user?.email || "User");
const avatarKey = user?.username || user?.email || "User";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-yellow-500/10 shadow-md">
      <nav className="flex flex-wrap items-center justify-between px-2 md:px-4 max-w-screen-2xl mx-auto py-2 lg:py-3 transition-all duration-300">
        {/* Logo & Text */}
        <Link to="/" className="flex items-center space-x-2 mr-2 min-w-[200px]">
          <img
            src={logo}
            alt="logo"
            className="h-16 w-auto object-contain drop-shadow-md transition-transform duration-300 ease-in-out hover:scale-110"
          />
          <div className="leading-tight">
            <h1 className="text-xl lg:text-2xl font-bold text-yellow-400 tracking-wider font-[Caveat] animate-bounce drop-shadow">
              PN Movie
            </h1>
            <p className="text-[10px] lg:text-sm text-yellow-200 italic font-semibold font-[Dancing Script] animate-fadeIn mt-0.5">
              Nơi mỗi khung hình là kiệt tác
            </p>
          </div>
        </Link>

        {/* Mobile menu button */}
        <button
          className="lg:hidden ml-auto text-white text-2xl"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>

        {/* Search bar */}
        <div className="w-full lg:flex-1 flex justify-center px-2 mt-3 lg:mt-0">
          <input
            type="text"
            placeholder="Tìm phim, diễn viên..."
            className="w-full max-w-xl px-5 py-2 rounded-full bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring focus:ring-yellow-400 text-base transition-all duration-300"
          />
        </div>

        {/* Menu */}
        <div
        className={`${
          isMobileMenuOpen ? "flex" : "hidden lg:flex"
        } flex-col lg:flex-row items-start lg:items-center gap-4 text-sm text-white font-medium mt-4 lg:mt-0 lg:ml-4 transition-all duration-300`}
      >
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "text-yellow-300 font-bold"
              : "hover:text-yellow-300 transition"
          }
        >
          Trang Chủ
        </NavLink>

        <NavLink
          to="/category"
          className={({ isActive }) =>
            isActive
              ? "text-yellow-300 font-bold"
              : "hover:text-yellow-300 transition"
          }
        >
          Chủ Đề
        </NavLink>

        {/* Dropdown thể loại */}
        <div className="relative" ref={genreDropdownRef}>
          <button
            onClick={() => {
              setGenreOpen(!isGenreOpen);
              setCountryOpen(false);
            }}
            className={`hover:text-yellow-300 transition ${
              isGenreOpen ? "text-yellow-300 font-bold" : ""
            }`}
            // Khi dropdown mở, cũng đổi màu để đồng bộ
          >
            Thể loại ▾
          </button>
          {isGenreOpen && (
            <div className="absolute left-0 bg-[#22283a]/95 text-white rounded-xl shadow-xl mt-2 min-w-[480px] z-50 p-6 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-1 border border-white/10 animate-fadeIn">
              {genres.map((g) => (
                <Link
                  to={`/genres/${g.id}`}
                  key={g.id}
                  className="px-2 py-1 rounded font-medium hover:bg-yellow-300/10 truncate transition block"
                  onClick={() => setGenreOpen(false)}
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <NavLink
          to="/single"
          className={({ isActive }) =>
            isActive
              ? "text-yellow-300 font-bold"
              : "hover:text-yellow-300 transition"
          }
        >
          Phim Lẻ
        </NavLink>
        <NavLink
          to="/series"
          className={({ isActive }) =>
            isActive
              ? "text-yellow-300 font-bold"
              : "hover:text-yellow-300 transition"
          }
        >
          Phim Bộ
        </NavLink>

        {/* Dropdown quốc gia */}
        <div className="relative" ref={countryDropdownRef}>
          <button
            onClick={() => {
              setCountryOpen(!isCountryOpen);
              setGenreOpen(false);
            }}
            className={`hover:text-yellow-300 transition ${
              isCountryOpen ? "text-yellow-300 font-bold" : ""
            }`}
          >
            Quốc gia ▾
          </button>
          {isCountryOpen && (
            <div className="absolute bg-[#22283a] text-white rounded shadow-lg mt-2 min-w-[160px] z-50 max-h-96 overflow-y-auto animate-fadeIn">
              {countries.map((c) => (
                <Link
                  to={`/country/${c.id}`}
                  key={c.id}
                  className="block px-4 py-2 hover:bg-yellow-300/10 transition"
                  onClick={() => setCountryOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <NavLink
          to="/actors"
          className={({ isActive }) =>
            isActive
              ? "text-yellow-300 font-bold"
              : "hover:text-yellow-300 transition"
          }
        >
          Diễn viên
        </NavLink>
      </div>

        {/* | separator */}
        <span className="mx-4 flex items-center select-none">
          <svg width="4" height="40" viewBox="0 0 4 40">
            <rect x="0" y="0" width="4" height="40" rx="2" fill="#f3f4f6" fillOpacity="0.32" />
          </svg>
        </span>

        {/* Nút đăng nhập hoặc avatar user */}
        <div className="ml-2 mt-3 lg:mt-0 relative">
          {user ? (
            <div ref={dropdownRef} className="relative flex items-center">
              {/* Avatar user*/}
              <button
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center overflow-hidden shadow hover:scale-105 transition-all duration-200 bg-yellow-300 ring-1 ring-white/20"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <img
                  src={user?.avatar ? user.avatar : getRandomAvatar(avatarKey)}
                  alt="avatar"
                  className="w-full h-full object-cover aspect-square rounded-full"
                  draggable={false}
                />
              </button>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="ml-1 flex items-center justify-center"
                tabIndex={-1}
                aria-label="Dropdown Arrow"
                style={{ background: "none", border: "none" }}
              >
                <svg
                  className={`w-6 h-6 text-white transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-[110%] w-60 bg-[#22283a] rounded-2xl shadow-xl border border-yellow-400/40 z-50 py-3 animate-fadeIn">
                  <div className="px-5 py-2 border-b border-yellow-200/20">
                    <div className="text-sm text-yellow-400 mb-1">Chào,</div>
                    <div className="font-semibold text-base truncate text-white">
                      {displayName}
                    </div>
                  </div>
                  <ul className="py-1">
                    <li>
                      <Link
                        to="/watch-later"
                        className="flex items-center gap-2 px-5 py-2 hover:bg-yellow-300/10 transition text-white"
                        onClick={() => setShowDropdown(false)}
                      >
                        <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                        </svg>
                        Xem sau
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/favorites"
                        className="flex items-center gap-2 px-5 py-2 hover:bg-yellow-300/10 transition text-white"
                        onClick={() => setShowDropdown(false)}
                      >
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.07l-7.682-7.682a4.5 4.5 0 010-6.364z"
                          />
                        </svg>
                        Yêu thích
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/continue"
                        className="flex items-center gap-2 px-5 py-2 hover:bg-yellow-300/10 transition text-white"
                        onClick={() => setShowDropdown(false)}
                      >
                        <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                          <polygon points="5,3 19,12 5,21" fill="currentColor" />
                        </svg>
                        Xem tiếp
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-5 py-2 hover:bg-yellow-300/10 transition text-white"
                        onClick={() => setShowDropdown(false)}
                      >
                        <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
                        </svg>
                        Tài khoản
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-5 py-2 hover:bg-yellow-200/20 text-red-400 font-semibold transition"
                      >
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12H7" />
                        </svg>
                        Thoát
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-semibold hover:bg-yellow-400 transition"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
              </svg>
              Thành viên
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
