// App.jsx (E-commerce)
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CustomerAuthProvider, useCustomerAuth } from './contexts/CustomerAuthContext';

// ... (Import Layouts, Pages, Modals, ScrollToTop, Error404 seperti sebelumnya) ...
import UserMainLayout from './layouts/public/UserMainLayout';
import UserMinimalLayout from './layouts/public/UserMinimalLayout';
import UserDashboardLayout from './layouts/public/UserDashboardLayout';
import ScrollToTop from './components/public/ScrollToTop';
import Homepage from './pages/public/homepage';
import About from './pages/public/about';
import Products from './pages/public/products';
import ProductDetail from './pages/public/ProductDetail';
import News from './pages/public/news';
import NewsDetail from './pages/public/NewsDetail';
import Contact from './pages/public/contact';
import Cart from './pages/public/cart';
import Checkout from './pages/public/checkout';
import AccountProfile from './pages/account/AccountProfile';
import AccountOrder from './pages/account/AccountOrder';
import AccountAddress from './pages/account/AccountAddress';
import LoginModal from './components/public/LoginModal';
import RegisterModal from './components/public/RegisterModal';
import Error404 from './pages/errors/error404';


// Komponen ProtectedRoute dimodifikasi
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAuthLoading, triggerLoginModal } = useCustomerAuth(); // Ambil triggerLoginModal
  const location = useLocation();

  useEffect(() => {
    // Jika masih loading auth, jangan lakukan apa-apa dulu
    if (isAuthLoading) {
      return;
    }
    // Jika tidak login DAN tidak sedang loading auth, panggil triggerLoginModal
    if (!isLoggedIn) {
      triggerLoginModal(location); // Kirim lokasi saat ini untuk redirect setelah login
    }
  }, [isLoggedIn, isAuthLoading, triggerLoginModal, location]); // Dependensi

  if (isAuthLoading) {
    return <div>Loading application state...</div>; 
  }

  if (!isLoggedIn) {
    // Selagi modal login muncul, kita bisa arahkan ke halaman utama atau tampilkan null
    // Mengarahkan ke halaman utama mungkin lebih baik agar ada background yang terlihat
    return <Navigate to="/" replace />; 
  }
  return children;
};


const App = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [redirectAfterLoginPath, setRedirectAfterLoginPath] = useState(null);

  // Fungsi ini akan di-pass ke CustomerAuthProvider
  const handleOpenModalRequest = (modalName, fromLocation = null) => {
    console.log("App.jsx: openModal requested for", modalName, "from", fromLocation);
    setActiveModal(modalName);
    if (fromLocation && fromLocation.pathname) {
      setRedirectAfterLoginPath(fromLocation.pathname + fromLocation.search + fromLocation.hash);
    } else {
      setRedirectAfterLoginPath(null); 
    }
  };

  const handleCloseModalRequest = () => {
    console.log("App.jsx: closeModal requested");
    setActiveModal(null);
    // Jangan reset redirectAfterLoginPath di sini, biarkan LoginModal yang menghapusnya setelah dipakai
  };
  
  const clearRedirectPath = () => {
    setRedirectAfterLoginPath(null);
  };

  return (
    // Teruskan fungsi handle modal ke provider
    <CustomerAuthProvider requestModalOpen={handleOpenModalRequest} requestModalClose={handleCloseModalRequest}>
      <Router>
        <ScrollToTop />
        
        {/* Render Modals di level atas */}
        {activeModal === 'login' && (
            <LoginModal 
                show={true} // Modal dikontrol oleh activeModal, jadi show selalu true jika dirender
                handleClose={handleCloseModalRequest} // Gunakan fungsi dari App.jsx
                openRegisterModal={() => handleOpenModalRequest('register', redirectAfterLoginPath || location)} 
                // openForgotPasswordModal={() => handleOpenModalRequest('forgotPassword')} 
                redirectPath={redirectAfterLoginPath}
                clearRedirectPath={clearRedirectPath}
            />
        )}
        {activeModal === 'register' && (
            <RegisterModal 
                show={true}
                handleClose={handleCloseModalRequest}
                switchToLogin={() => handleOpenModalRequest('login', location)} 
            />
        )}
        {/* {activeModal === 'forgotPassword' && <ForgotPasswordModal ... />} */}

        <Routes>
          {/* UserMainLayout sekarang akan menerima openModal dari App.jsx melalui context (jika Navbar diubah) */}
          {/* atau tetap teruskan sebagai prop jika Navbar belum pakai context untuk ini */}
          <Route element={<UserMainLayout openModal={(modal, from) => handleOpenModalRequest(modal, from)} />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail openModal={(modal, from) => handleOpenModalRequest(modal, from)} />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart openModal={(modal, from) => handleOpenModalRequest(modal, from)} />} />
            
            {/* Hapus rute /login-required */}
          </Route>

          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <UserMainLayout openModal={(modal, from) => handleOpenModalRequest(modal, from)}>
                  <Checkout />
                </UserMainLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <UserDashboardLayout openModal={(modal, from) => handleOpenModalRequest(modal, from)} /> 
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<AccountProfile />} />
            <Route path="orders" element={<AccountOrder />} />
            <Route path="address" element={<AccountAddress />} />
          </Route>

          <Route element={<UserMinimalLayout />}>
            <Route path="*" element={<Error404 />} /> 
          </Route>
        </Routes>
      </Router>
    </CustomerAuthProvider>
  );
}

export default App;