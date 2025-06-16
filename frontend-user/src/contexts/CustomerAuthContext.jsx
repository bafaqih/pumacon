import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../services/apiClient';

const CustomerAuthContext = createContext(null);
const CUSTOMER_TOKEN_KEY = 'customerAuthToken';

export const CustomerAuthProvider = ({ children, requestModalOpen, requestModalClose }) => {
    const [token, setToken] = useState(null); 
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false); 
    const [authError, setAuthError] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true); 

    const fetchCustomerDetails = useCallback(async (currentTokenForFetch) => {
        if (!currentTokenForFetch) {
            setCurrentUser(null);
            setIsAuthLoading(false); 
            return;
        }
        
        try {
            console.log("[AuthContext] Fetching customer details with token...");
            const response = await apiClient.get('/user/profile');
            const userData = response.data.customer || response.data.user || response.data;
            
            console.log("[AuthContext] Customer details fetched:", userData);
            setCurrentUser(userData);

        } catch (error) {
            console.error("Gagal mengambil detail customer:", error.response?.data?.error || error.message);
            setAuthError("Gagal memuat detail customer."); 
            setToken(null); 
            setCurrentUser(null); 
        } finally {
            setIsAuthLoading(false); 
            console.log("[AuthContext] fetchCustomerDetails finished. isAuthLoading:", false);
        }
    }, []); 

    useEffect(() => {
        console.log("[AuthContext] Initial mount: Checking localStorage for token.");
        const storedToken = localStorage.getItem(CUSTOMER_TOKEN_KEY);
        if (storedToken) {
            console.log("[AuthContext] Token found in localStorage, setting token state.");
            setToken(storedToken); 
        } else {
            console.log("[AuthContext] No token in localStorage. Initial auth loading finished.");
            setIsAuthLoading(false); 
        }
    }, []);

    useEffect(() => {
        console.log("[AuthContext] Token changed:", token ? "Exists" : "Null");
        if (token) {
            localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            console.log("[AuthContext] Token found, calling fetchCustomerDetails.");
            setIsAuthLoading(true);
            fetchCustomerDetails(token); 
        } else {
            localStorage.removeItem(CUSTOMER_TOKEN_KEY);
            delete apiClient.defaults.headers.common['Authorization'];
            setCurrentUser(null);
            console.log("[AuthContext] Token removed. Clearing user details. isAuthLoading set to false.");
            setIsAuthLoading(false);
        }
    }, [token, fetchCustomerDetails]);

    const login = async (credentials) => {
        setLoading(true);
        setAuthError(null);
        try {
            const response = await apiClient.post('/user/login', credentials);
            const newToken = response.data.token;
            setToken(newToken); 
            setLoading(false); 
            if (typeof requestModalClose === 'function') {
                requestModalClose();
            }
            return true;
        } catch (error) {
            setLoading(false);
            const errorMessage = error.response?.data?.error || 'Login gagal. Periksa kredensial Anda.';
            setAuthError(errorMessage);
            console.error("AuthContext Customer Login error:", error.response || error);
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
            console.error("AuthContext Customer Register error:", error.response || error);
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        setToken(null); 
        console.log("Customer logged out");
    };
    
    const triggerLoginModal = (fromLocation) => {
        console.log("[AuthContext] triggerLoginModal dipanggil. Prop requestModalOpen:", typeof requestModalOpen);
        if (typeof requestModalOpen === 'function') {
            requestModalOpen('login', fromLocation);
        } else {
            console.error("[AuthContext] Gagal memicu modal login: prop requestModalOpen bukan fungsi.");
        }
    };

    const triggerRegisterModal = (fromLocation) => {
        console.log("[AuthContext] triggerRegisterModal dipanggil. Prop requestModalOpen:", typeof requestModalOpen);
        if (typeof requestModalOpen === 'function') {
            requestModalOpen('register', fromLocation);
        } else {
            console.error("[AuthContext] Gagal memicu modal register: prop requestModalOpen bukan fungsi.");
        }
    };

    const value = useMemo(() => ({
        token,
        currentUser,
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
        refreshUserDetails: () => { if(token) { setIsAuthLoading(true); fetchCustomerDetails(token); }} 
    }), [token, currentUser, loading, isAuthLoading, authError, requestModalClose, fetchCustomerDetails]);

    return (
        <CustomerAuthContext.Provider value={value}>
            {isAuthLoading ? null : children}
        </CustomerAuthContext.Provider>
    );
};

export const useCustomerAuth = () => {
    const context = useContext(CustomerAuthContext); 
    if (!context) {
        throw new Error('useCustomerAuth must be used within a CustomerAuthProvider. The context is null or undefined, indicating no Provider was found in the component tree above.');
    }
    return context;
};