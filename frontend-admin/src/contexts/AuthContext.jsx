import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('adminAuthToken'));
  const [adminDetails, setAdminDetails] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [loadingDetails, setLoadingDetails] = useState(false); 
  const [authError, setAuthError] = useState(null);

    const fetchAdminDetails = useCallback(async (currentAuthToken) => {
    if (!currentAuthToken) {
        setAdminDetails(null);
        return;
    }
    setLoadingDetails(true);
    setAuthError(null);
    try {
      const decodedToken = jwtDecode(currentAuthToken);
      const employeeIdFromToken = decodedToken.employee_id;

      if (!employeeIdFromToken) {
          throw new Error("Employee ID tidak ditemukan di dalam token.");
      }

      console.log('[AuthContext] fetchAdminDetails: Token yang digunakan:', currentAuthToken);
      console.log('[AuthContext] fetchAdminDetails: Axios default auth header:', api.defaults.headers.common['Authorization']);

      const response = await api.get(`/admin/profile`);

      console.log('[AuthContext] fetchAdminDetails: Respons dari /admin/profile:', response.data);
      
      setAdminDetails({
        employeeId: response.data.employeeId || employeeIdFromToken,
        fullName: response.data.fullName,
        role: response.data.role || decodedToken.role,
        image: response.data.image,
      });

    } catch (error) {
      console.error("Gagal mengambil detail admin:", error);
      setAuthError("Gagal memuat detail admin. Sesi mungkin tidak valid.");
      setToken(null);
      setAdminDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

    useEffect(() => {
    if (token) {
      localStorage.setItem('adminAuthToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchAdminDetails(token); 
    } else {
      localStorage.removeItem('adminAuthToken');
      delete api.defaults.headers.common['Authorization'];
      setAdminDetails(null);
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
      setToken(newToken);
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
    setToken(null);
    console.log("Admin logged out");
  };

  const registerAdmin = async (employeeId, password) => {
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
    adminDetails,
    isLoggedIn: !!token,
    loading,
    loadingDetails,
    authError,
    login,
    logout,
    registerAdmin,
    clearAuthError: () => setAuthError(null),
    refreshAdminDetails: () => { if(token) fetchAdminDetails(token); }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { 
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};