// src/contexts/CustomerAuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'; // Pastikan useMemo juga diimpor
import apiClient from '../services/apiClient';
import { jwtDecode } from 'jwt-decode';

const CustomerAuthContext = createContext(null);
const CUSTOMER_TOKEN_KEY = 'customerAuthToken';

export const CustomerAuthProvider = ({ children, requestModalOpen, requestModalClose }) => {
    const [token, setToken] = useState(localStorage.getItem(CUSTOMER_TOKEN_KEY));
    const [currentUser, setCurrentUser] = useState(null); // <-- Ini state setter-nya
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const fetchCustomerDetails = useCallback(async (currentTokenForFetch) => {
        if (!currentTokenForFetch) {
            setCurrentUser(null);
            setIsAuthLoading(false);
            return;
        }
        setIsAuthLoading(true);
        try {
            const response = await apiClient.get('/user/profile');
            const userData = response.data.customer || response.data.user || response.data;

            setCurrentUser({
                ...userData,
                hasAddress: userData.hasAddress
            });
        } catch (error) {
            console.error("Gagal mengambil detail customer:", error.response?.data?.error || error.message);
            setToken(null);
            setCurrentUser(null);
        } finally {
            setIsAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem(CUSTOMER_TOKEN_KEY);
        if (storedToken) {
            setToken(storedToken);
        } else {
            setIsAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchCustomerDetails(token);
        } else {
            localStorage.removeItem(CUSTOMER_TOKEN_KEY);
            delete apiClient.defaults.headers.common['Authorization'];
            setCurrentUser(null);
        }
    }, [token, fetchCustomerDetails]);

    const login = async (credentials) => {
        setLoading(true);
        setAuthError(null);
        try {
            const response = await apiClient.post('/user/login', credentials);
            const newToken = response.data.token;
            const userDataFromLogin = response.data.user;

            setToken(newToken);
            setCurrentUser(prevUser => ({
                ...prevUser,
                ...userDataFromLogin,
                hasAddress: userDataFromLogin?.hasAddress
            }));

            setLoading(false);
            if (typeof requestModalClose === 'function') requestModalClose();
            return true;
        } catch (error) {
            setLoading(false);
            const errorMessage = error.response?.data?.error || 'Login gagal. Periksa kredensial Anda.';
            setAuthError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setAuthError(null);
        try {
            const response = await apiClient.post('/user/register', userData);
            setLoading(false);
            return response.data;
        } catch (error) {
            setLoading(false);
            const errorMessage = error.response?.data?.error || 'Registrasi gagal.';
            setAuthError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        setToken(null);
    };

    const triggerLoginModal = (fromLocation) => {
        if (typeof requestModalOpen === 'function') {
            requestModalOpen('login', fromLocation);
        }
    };

    const triggerRegisterModal = (fromLocation) => {
        if (typeof requestModalOpen === 'function') {
            requestModalOpen('register', fromLocation);
        }
    };

    const value = useMemo(() => ({
        token,
        currentUser,
        setCurrentUser, // <-- TAMBAHKAN INI
        isLoggedIn: !!token,
        loading,
        isAuthLoading,
        authError,
        login,
        register,
        logout,
        clearAuthError: () => setAuthError(null),
        triggerLoginModal,
        triggerRegisterModal,
        closeActiveModal: requestModalClose,
    }), [currentUser, token, setCurrentUser]); // <-- PASTIKAN setCurrentUser juga ada di dependency array

    return (
        <CustomerAuthContext.Provider value={value}>
            {isAuthLoading ? null : children}
        </CustomerAuthContext.Provider>
    );
};

export const useCustomerAuth = () => {
    const context = useContext(CustomerAuthContext);
    if (context === undefined) {
        throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
    }
    return context;
};