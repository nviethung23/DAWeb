import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginModal from "./pages/LoginModal";
import RegisterModal from "./pages/RegisterModal";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import GenrePage from "./pages/Genre";
import Profile from "./pages/Profile";
import Actors from "./pages/Actors";
import ActorsDetail from "./pages/Actorsdetail";
import Favorites from "./pages/Favorites";
import SeriesPage from "./pages/Series";
import SinglePage from "./pages/Single";
import CountryPage from "./pages/Country";
import WatchLater from "./components/WatchLater";
import SearchPage from "./pages/SearchPage"; 
import ForgotPasswordModal from "./pages/ForgotPasswordModal"; 

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUser from "./pages/AdminUser";
import AdminCategory from "./pages/AdminCategory";
import AdminMovies from "./pages/AdminMovies";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const location = useLocation();
  const [showForgot, setShowForgot] = useState(false);
  // Nếu đang ở route admin thì KHÔNG render Navbar
  const isAdminRoute = location.pathname.startsWith("/admin");
  return (
     <AuthProvider>
      {!isAdminRoute && <Navbar onLoginClick={() => setShowLogin(true)} />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/genres/:id" element={<GenrePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/actors" element={<Actors />} />
        <Route path="/actors/:id" element={<ActorsDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/series" element={<SeriesPage />} />
        <Route path="/single" element={<SinglePage />} />
        <Route path="/country/:id" element={<CountryPage />} />
        <Route path="/watch-later" element={<WatchLater />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Admin Layout & Nested */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="user" element={<AdminUser />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="category" element={<AdminCategory />} />
        </Route>
      </Routes>
      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onShowRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
        onShowForgot={() => {
          setShowLogin(false);
          setShowForgot(true); // <- Chỗ này rất quan trọng!
        }}
      />
      <RegisterModal
        show={showRegister}
        onClose={() => setShowRegister(false)}
        onShowLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />

      <ForgotPasswordModal
        show={showForgot}
        onClose={() => setShowForgot(false)}
      />

      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}

export default App;
