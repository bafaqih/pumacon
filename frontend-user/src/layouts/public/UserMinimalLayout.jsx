import React from 'react';
import { Outlet } from 'react-router-dom';
const UserMinimalLayout = () => {
  return (

      <main>
        <Outlet />
      </main>

  );
};

export default UserMinimalLayout;