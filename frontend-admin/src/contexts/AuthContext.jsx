// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Asumsi Anda punya file src/services/api.js
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminAuthToken'));
  const [adminDetails, setAdminDetails] = useState(null); // <--- State untuk detail admin
  const [loading, setLoading] = useState(false); // Loading umum untuk proses auth
  const [loadingDetails, setLoadingDetails] = useState(false); // Loading untuk fetch details
  const [authError, setAuthError] = useState(null);

    const fetchAdminDetails = useCallback(async (currentAuthToken) => {
    if (!currentAuthToken) {
        setAdminDetails(null);
        return;
    }
    setLoadingDetails(true);
    setAuthError(null);
    try {
      // Dekode token untuk mendapatkan EmployeeID (jika tidak dikirim langsung dari login)
      const decodedToken = jwtDecode(currentAuthToken);
      const employeeIdFromToken = decodedToken.employee_id; // Sesuaikan dengan nama claim Anda

      if (!employeeIdFromToken) {
          throw new Error("Employee ID tidak ditemukan di dalam token.");
      }

      console.log('[AuthContext] fetchAdminDetails: Token yang digunakan:', currentAuthToken);
      console.log('[AuthContext] fetchAdminDetails: Axios default auth header:', api.defaults.headers.common['Authorization']);

      const response = await api.get(`/admin/profile`); // Backend akan tahu siapa dari token

      console.log('[AuthContext] fetchAdminDetails: Respons dari /admin/profile:', response.data); // Log respons sukses
      
      // Simpan detail yang relevan
      setAdminDetails({
        employeeId: response.data.employeeId || employeeIdFromToken, // Ambil dari response jika ada, atau dari token
        fullName: response.data.fullName,
        role: response.data.role || decodedToken.role, // Ambil dari response jika ada, atau dari token
        image: response.data.image, // Path atau URL gambar
      });

    } catch (error) {
      console.error("Gagal mengambil detail admin:", error);
      setAuthError("Gagal memuat detail admin. Sesi mungkin tidak valid.");
      // Jika gagal fetch detail (misal token expired), logout
      setToken(null); // Ini akan memicu useEffect di bawah untuk clear localStorage & header
      setAdminDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

    useEffect(() => {
    if (token) {
      localStorage.setItem('adminAuthToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchAdminDetails(token); // Ambil detail admin jika token ada (saat load/refresh)
    } else {
      localStorage.removeItem('adminAuthToken');
      delete api.defaults.headers.common['Authorization'];
      setAdminDetails(null); // Hapus detail admin jika tidak ada token
    }
  }, [token, fetchAdminDetails])

  const login = async (employeeId, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.post('/admin/login', {
        employee_id: employeeId,
        password: password,
      });
      const newToken = response.data.token;
      setToken(newToken); // Ini akan memicu useEffect di atas untuk fetchAdminDetails
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.error || 'Login gagal. Periksa kredensial Anda.';
      setAuthError(errorMessage);
      console.error("AuthContext Login error:", error);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setToken(null); // Ini akan memicu useEffect untuk clear localStorage, header, dan adminDetails
    // Redirect ke login akan dihandle oleh ProtectedRoute atau komponen yang memanggil logout
    console.log("Admin logged out");
  };

  // --- FUNGSI REGISTER ADMIN SEKARANG AKTIF ---
  const registerAdmin = async (employeeId, password) => {
    // ... (implementasi registerAdmin Anda)
    setLoading(true);
    setAuthError(null);
    try {
      const response = await api.post('/admin/register', {
        employee_id: employeeId,
        password: password,
      });
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.error || 'Registrasi gagal.';
      setAuthError(errorMessage);
      console.error("AuthContext Register error:", error);
      throw new Error(errorMessage);
    }
  };

  const value = {
    token,
    adminDetails, // <--- Ekpos adminDetails
    isLoggedIn: !!token,
    loading,
    loadingDetails, // <--- Ekpos loadingDetails
    authError,
    login,
    logout,
    registerAdmin,
    clearAuthError: () => setAuthError(null),
    refreshAdminDetails: () => { if(token) fetchAdminDetails(token); } // <--- Fungsi untuk refresh manual jika perlu
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { // Perbaikan: context bisa null, undefined lebih tepat untuk pengecekan awal
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};