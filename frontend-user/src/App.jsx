import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CustomerAuthProvider, useCustomerAuth } from './contexts/CustomerAuthContext';

// Layouts
import UserMainLayout from './layouts/public/UserMainLayout';
import UserMinimalLayout from './layouts/public/UserMinimalLayout';
import UserDashboardLayout from './layouts/public/UserDashboardLayout';
import ScrollToTop from './components/public/ScrollToTop';

// Pages
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


const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAuthLoading, triggerLoginModal } = useCustomerAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!isLoggedIn) {
      triggerLoginModal(location);
    }
  }, [isLoggedIn, isAuthLoading, triggerLoginModal, location]); 

  if (isAuthLoading) {
    return <div>Loading application state...</div>; 
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />; 
  }
  return children;
};


const App = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [redirectAfterLoginPath, setRedirectAfterLoginPath] = useState(null);
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
  };
  
  const clearRedirectPath = () => {
    setRedirectAfterLoginPath(null);
  };

  return (
    <CustomerAuthProvider requestModalOpen={handleOpenModalRequest} requestModalClose={handleCloseModalRequest}>
      <Router>
        <ScrollToTop />
        
        {activeModal === 'login' && (
            <LoginModal 
                show={true} 
                handleClose={handleCloseModalRequest} 
                openRegisterModal={() => handleOpenModalRequest('register', redirectAfterLoginPath || location)} 
                
                redirectPath={redirectAfterLoginPath}
                clearRedirectPath={clearRedirectPath}
            />
        )}
        {activeModal === 'register' && (
            <RegisterModal 
                show={true}
                handleClose={handleCloseModalRequest}
                switchToLogin={() => handleOpenModalRequest('login', redirectAfterLoginPath || location)}
            />
        )}

        <Routes>
          <Route element={<UserMainLayout openModal={(modal, from) => handleOpenModalRequest(modal, from)} />}>
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productSKU" element={<ProductDetail openModal={(modal, from) => handleOpenModalRequest(modal, from)} />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart openModal={(modal, from) => handleOpenModalRequest(modal, from)} />} />
          </Route>

          <Route 
            element={
              <ProtectedRoute>
                <UserMainLayout openModal={(modal, from) => handleOpenModalRequest(modal, from)} />
              </ProtectedRoute>
            }
          >
            <Route path="/checkout" element={<Checkout />} />
          </Route>
          
          <Route 
            element={
              <ProtectedRoute>
                <UserDashboardLayout openModal={(modal, from) => handleOpenModalRequest(modal, from)} /> 
              </ProtectedRoute>
            }
          >
            <Route path="/account" element={<Navigate to="/account/profile" replace />} /> 
            <Route path="/account/profile" element={<AccountProfile />} />
            <Route path="/account/orders" element={<AccountOrder />} />
            <Route path="/account/address" element={<AccountAddress />} />
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