import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Nếu đã có token, set header mặc định cho axios (giữ login khi F5)
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + user.token;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [user]);

  // Hàm đăng nhập
  async function login(username, password) {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      // Nhận tất cả trường trả về từ backend
      const userData = {
        token: res.data.token,
        role: res.data.role,
        email: res.data.email,
        username: res.data.username,
        displayName: res.data.displayName || "",
        avatar: res.data.avatar || "",
        gender: res.data.gender || "",
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = "Bearer " + res.data.token;
      return { success: true, role: res.data.role };
    } catch (error) {
      return { success: false, error: error?.response?.data?.error || "Đăng nhập thất bại" };
    }
  }

  // Hàm đăng xuất
  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
  }

  // Hàm đăng ký
  async function register({ username, password, email }) {
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        username, password, email,
      });
      return { success: true, data: res.data };
    } catch (err) {
      let msg = "Đăng ký thất bại";
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      }
      return { success: false, error: msg };
    }
  }

  // Hàm cập nhật profile
  async function updateProfile(profileData) {
    try {
      const token = user?.token;
      await axios.patch(
        "http://localhost:5000/api/profile",
        profileData,
        { headers: { Authorization: "Bearer " + token } }
      );
      // Lấy lại profile mới nhất từ backend
      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: "Bearer " + token }
      });
      setUser((u) => ({ ...u, ...res.data }));
      localStorage.setItem("user", JSON.stringify({ ...user, ...res.data }));
      return { success: true };
    } catch (err) {
      let errorMsg = "Có lỗi xảy ra";
      if (err.response && err.response.data && err.response.data.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  }

  // Hàm lấy lại profile (nếu cần)
  async function fetchProfile() {
    try {
      const token = user?.token;
      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: "Bearer " + token }
      });
      setUser((u) => ({ ...u, ...res.data }));
      localStorage.setItem("user", JSON.stringify({ ...user, ...res.data }));
    } catch {
      // Nếu fail có thể logout
      logout();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateProfile,
        fetchProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
