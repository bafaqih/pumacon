import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { User, ShoppingBag, MapPin, HelpCircle, LogOut } from 'react-feather';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

const SidebarAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState(null);

  const { currentUser, logout } = useCustomerAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const sidebarStyle = {
  };

  const userInfoWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid #e9ecef',
    padding: '1rem',
  };

  const avatarStyle = {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '50%',
  };

  const navAccountContainerStyle = {
    marginTop: '1.5rem',
  };

  const navAccountListStyle = {
    listStyle: 'none',
    paddingLeft: '0',
    margin: '0',
    border: '1px solid #e9ecef',
  };

  const navItemBaseStyle = {
    borderTop: '1px solid #e9ecef',
  };
  const firstNavItemStyle = {
    borderTop: 'none',
  };

  const navLinkBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '1rem 1.25rem',
    color: '#343a40',
    fontWeight: 500,
    textDecoration: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    gap: '0.8rem',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
  };

  const navLinkHoverStyle = {
    backgroundColor: '#f8f9fa',
    color: '#0d6efd',
  };

  const navLinkActiveStyle = {
    backgroundColor: '#212529',
    color: '#ffffff',
    fontWeight: 600,
  };

  const featherIconStyle = {
    width: '18px',
    height: '18px',
    strokeWidth: 2,
  };

  const featherIconActiveStyle = {
    ...featherIconStyle,
    color: '#ffffff',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { to: "/account/profile", Icon: User, label: "Personal Info" },
    { to: "/account/orders", Icon: ShoppingBag, label: "Order" },
    { to: "/account/address", Icon: MapPin, label: "Address" },
    { to: "/contact", Icon: HelpCircle, label: "Help Center" },
  ];

  const firstName = currentUser?.detail?.first_name || '';
  const lastName = currentUser?.detail?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();


  const userImage = currentUser?.detail?.image || '/assets/images/avatar/avatar-1.jpg'; 

  return (
    <div className="col-lg-3 col-md-4" style={sidebarStyle}>
      <div className="mb-4 text-center text-md-start">
        <div style={userInfoWrapperStyle}>
          <div className="overflow-hidden">
            <h3 className="mb-0 fs-5">{fullName || 'Guest'}</h3> 
            <p className="mb-0 small text-truncate">{currentUser?.email || 'N/A'}</p> 
          </div>
        </div>
      </div>

      <div className="d-md-none text-center d-grid">
        <button
          className="btn btn-light mb-3 d-flex align-items-center justify-content-between"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseAccountMenu"
          aria-expanded="false"
          aria-controls="collapseAccountMenu"
        >
          Account Menu
          <i className="bi bi-chevron-down ms-2"></i>
        </button>
      </div>

      <div className="collapse d-md-block" id="collapseAccountMenu">
        <div style={navAccountContainerStyle}>
          <h3 className="fs-5 mb-3">My Account</h3>
          <ul style={navAccountListStyle} className="nav flex-column">
            {menuItems.map((item, index) => (
              <li
                key={item.to}
                style={index === 0 ? firstNavItemStyle : navItemBaseStyle}
              >
                <NavLink
                  to={item.to}
                  style={({ isActive }) => ({
                    ...navLinkBaseStyle,
                    ...(isActive ? navLinkActiveStyle : {}),
                    ...(hoveredLink === item.to && !isActive ? navLinkHoverStyle : {})
                  })}
                  onMouseEnter={() => setHoveredLink(item.to)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <item.Icon
                    style={ location.pathname === item.to || (location.pathname.startsWith("/account") && item.to.startsWith("/account") && location.pathname.includes(item.to.split('/')[2])) ? featherIconActiveStyle : featherIconStyle }
                  />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
            <li
                style={navItemBaseStyle}
            >
                <button
                    onClick={handleLogout}
                    style={{
                        ...navLinkBaseStyle,
                        backgroundColor: (hoveredLink === 'logout-button' ? navLinkHoverStyle.backgroundColor : 'transparent'),
                        color: (hoveredLink === 'logout-button' ? navLinkHoverStyle.color : navLinkBaseStyle.color),
                    }}
                    onMouseEnter={() => setHoveredLink('logout-button')}
                    onMouseLeave={() => setHoveredLink(null)}
                >
                    <LogOut
                        style={hoveredLink === 'logout-button' ? featherIconActiveStyle : featherIconStyle}
                    />
                    <span>Log Out</span>
                </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SidebarAccount;