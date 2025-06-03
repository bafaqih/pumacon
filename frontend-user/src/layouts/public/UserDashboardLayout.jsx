import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarAccount from '../../components/public/SidebarAccount';
import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';

const UserDashboardLayout = () => {
  const headerBoxStyle = {
    backgroundColor: 'white',
    height: '100px',
    width: '100%',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  };

  const contentSectionStyle = {
    paddingTop: '90px',
    paddingBottom: '150px',
  };

  return (
    <>
      <Navbar /> {/* Tambahkan Navbar di sini */}
      <div style={headerBoxStyle}></div>

      <section style={contentSectionStyle}>
        <div className="container">
          <div className="row">
            <SidebarAccount />
            <Outlet />
          </div>
        </div>
      </section>

      <Footer /> {/* Tambahkan Footer di sini */}
    </>
  );
};

export default UserDashboardLayout;
