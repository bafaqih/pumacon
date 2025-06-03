import React from 'react';
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

const AdminMainLayout = () => {
  return (
    <div id="main-wrapper" data-layout="vertical" data-navbarbg="skin5">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <Outlet /> 
        <Footer />
      </div>
    </div>
  );
};

export default AdminMainLayout;