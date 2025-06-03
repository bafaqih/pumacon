// src/layouts/public/UserMainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/public/Navbar'; // Sesuaikan path jika perlu
import Footer from '../../components/public/Footer';   // Sesuaikan path jika perlu
import ScrollToTopButton from '../../components/public/ScrollToTopButton'; // Sesuaikan path jika perlu

const UserMainLayout = ({ openModal }) => { // Terima prop openModal
  return (
    <>
      <Navbar openModal={openModal} /> {/* Teruskan prop openModal ke Navbar */}
      <main>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </>
  );
};

export default UserMainLayout;