// src/components/public/Navbar.jsx
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lang, setLang] = useState(() => localStorage.getItem('i18nextLng')?.toUpperCase().substring(0,2) || "EN");

  const { t, i18n } = useTranslation();

  const { isLoggedIn, currentUser, logout, triggerLoginModal } = useCustomerAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleAccountIconClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/account/profile');
    } else {
      if (typeof triggerLoginModal === 'function') {
        triggerLoginModal(location);
      } else {
        console.warn("triggerLoginModal function is not available in AuthContext");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleLang = () => {
    const newLang = lang === "EN" ? "ID" : "EN";
    setLang(newLang);
    i18n.changeLanguage(newLang.toLowerCase());
  };

  const handleNavClick = (e, path) => {
    e.preventDefault();
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <header className="site-header mo-left header header-transparent">
      <div className="sticky-header main-bar-wraper navbar-expand-lg">
        <div className="main-bar clearfix ">
          <div className="container clearfix">
            <div className="logo-header">
              <Link to="/" onClick={handleLogoClick} className="logo-dark">
                <img src="/images/logo.png" alt="Logo" />
              </Link>
            </div>

            <button className="navbar-toggler collapsed navicon justify-content-end" type="button"
              data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
              aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
              <span></span><span></span><span></span>
            </button>

            <div className="extra-nav">
              <div className="extra-cell">
                <ul className="navbar-nav header-right">
                  <li className="nav-item">
                    <Link to="/cart" className="nav-link box cart-btn" title="View Cart">
                      <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" >
                        <path fillRule="evenodd" clipRule="evenodd" d="M17.0141 21.8957H8.66628C5.59992 21.8957 3.24752 20.7881 3.91571 16.3305L4.69374 10.2893C5.10564 8.065 6.52441 7.21375 7.76926 7.21375H17.9477C19.2109 7.21375 20.5473 8.12908 21.0233 10.2893L21.8013 16.3305C22.3688 20.2847 20.0805 21.8957 17.0141 21.8957Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17.1515 6.99411C17.1515 4.60804 15.2172 2.67374 12.8311 2.67374V2.67374C11.6821 2.66888 10.5785 3.12191 9.76430 3.93266C8.95011 4.74341 8.49242 5.84510 8.49243 6.99411V6.99411" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.7967 11.4976H15.7509" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.96614 11.4976H9.92038" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </li>
                  
                  {/* --- IKON AKUN/PROFIL --- */}
                  <li className="nav-item">
                    <a // Menggunakan <a> karena onClick yang menangani aksi
                      href="#!"
                      className="nav-link" // Sesuaikan kelas jika perlu
                      onClick={handleAccountIconClick}
                      title={isLoggedIn ? (currentUser?.name || currentUser?.email || "My Account") : "Login / Register"}
                      role="button"
                      style={{ cursor: 'pointer' }}
                    >
                      {isLoggedIn && currentUser?.avatar ? ( // Contoh jika ada avatar di currentUser
                          <img src={currentUser.avatar} alt="avatar" style={{width: 25, height: 25, borderRadius: '50%'}} />
                      ) : (
                        <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12.4852 15.7419C8.61755 15.7419 5.31470 16.3267 5.31470 18.6686C5.31470 21.0105 8.59660 21.6162 12.4852 21.6162C16.3528 21.6162 19.6547 21.0305 19.6547 18.6896C19.6547 16.3486 16.3737 15.7419 12.4852 15.7419Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path fillRule="evenodd" clipRule="evenodd" d="M12.4851 12.4016C15.0232 12.4016 17.0804 10.3435 17.0804 7.80544C17.0804 5.26735 15.0232 3.21021 12.4851 3.21021C9.94704 3.21021 7.88894 5.26735 7.88894 7.80544C7.88037 10.335 9.92418 12.3931 12.4528 12.4016H12.4851Z" stroke="white" strokeWidth="1.42857" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </a>
                  </li>

                  <li className="nav-item">
                    <a href="#!" className="nav-link box text-white" onClick={toggleLang} role="button" title="Toggle Language">
                      {lang}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="header-nav navbar-collapse collapse" id="navbarNavDropdown">
              <div className="logo-header">
                <Link to="/" onClick={handleLogoClick} className="logo-dark">
                  <img src="/images/logo.png" alt="Logo" />
                </Link>
              </div>
              <ul className="nav navbar-nav navbar navbar-left">
                <li><NavLink to="/" onClick={(e) => handleNavClick(e, '/')} className={({ isActive }) => isActive ? 'active' : ''}>{t("home")}</NavLink></li>
                <li><NavLink to="/about" onClick={(e) => handleNavClick(e, '/about')} className={({ isActive }) => isActive ? 'active' : ''}>{t("about")}</NavLink></li>
                <li><NavLink to="/products" onClick={(e) => handleNavClick(e, '/products')} className={({ isActive }) => isActive ? 'active' : ''}>{t("products")}</NavLink></li>
                <li><NavLink to="/news" onClick={(e) => handleNavClick(e, '/news')} className={({ isActive }) => isActive ? 'active' : ''}>{t("news")}</NavLink></li>
                <li><NavLink to="/contact" onClick={(e) => handleNavClick(e, '/contact')} className={({ isActive }) => isActive ? 'active' : ''}>{t("contact")}</NavLink></li>
                {/* --- HAPUS BLOK KODE INI UNTUK MENGHILANGKAN LINK "My Account" DARI NAVIGASI UTAMA --- */}
                {/*
                {isLoggedIn && (
                    <li><NavLink to="/account/profile" onClick={(e) => handleNavClick(e, '/account/profile')} className={({ isActive }) => isActive ? 'active' : ''}>My Account</NavLink></li>
                )}
                */}
                {/* --- AKHIR BLOK KODE YANG DIHAPUS --- */}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Rendering Modal sudah dipindahkan ke App.jsx */}
    </header>
  );
};

export default Navbar;