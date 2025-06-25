import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginModal from "./pages/LoginModal";
import RegisterModal from "./pages/RegisterModal";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import AdminDashboard from "./pages/AdminDashboard";
import GenrePage from "./pages/Genre";
import Profile from "./pages/Profile";
import Actors from "./pages/Actors";
import ActorsDetail from "./pages/Actorsdetail";
import Favorites from "./pages/Favorites";
import SeriesPage from "./pages/Series";
import SinglePage from "./pages/Single";
import CountryPage from "./pages/Country";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // <-- thêm dòng này

  return (
    <AuthProvider>
      <Navbar onLoginClick={() => setShowLogin(true)} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/genres/:id" element={<GenrePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/actors" element={<Actors />} />
        <Route path="/actors/:id" element={<ActorsDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/series" element={<SeriesPage />} />
        <Route path="/single" element={<SinglePage />} />
        <Route path="/country/:id" element={<CountryPage />} />
      </Routes>

      <LoginModal
        show={showLogin}
        onClose={() => setShowLogin(false)}
        onShowRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
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

      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}

export default App;
