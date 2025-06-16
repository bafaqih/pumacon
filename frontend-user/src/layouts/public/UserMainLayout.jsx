import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/public/Navbar'; 
import Footer from '../../components/public/Footer';   
import ScrollToTopButton from '../../components/public/ScrollToTopButton';

const UserMainLayout = ({ openModal }) => { 
  return (
    <>
      <Navbar openModal={openModal} /> 
      <main>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </>
  );
};

export default UserMainLayout;