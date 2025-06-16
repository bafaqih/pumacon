import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
    const { adminDetails, logout, loadingDetails } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); 
        navigate('/dashboard/login', { replace: true });
    };

    const defaultAvatar = '/assets/images/avatar/avatar-1.jpg'; 
    const backendAssetBaseUrl = 'http://localhost:8080';

    const getProfileImageUrl = (imagePath) => {
        if (!imagePath) {
            return defaultAvatar;
        }
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return `${backendAssetBaseUrl}/${cleanPath}`;
    };

    if (loadingDetails && !adminDetails) {
        return (
            <nav className="navbar navbar-expand-lg navbar-glass">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div>{/* Placeholder untuk tombol sidebar mobile */}</div>
                        <div>Memuat data admin...</div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-glass">
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-flex align-items-center">
                        <Link
                            className="text-inherit d-block d-xl-none me-4"
                            data-bs-toggle="offcanvas"
                            to="#offcanvasExample"
                            role="button"
                            aria-controls="offcanvasExample"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-text-indent-right" viewBox="0 0 16 16">
                                <path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm10.646 2.146a.5.5 0 0 1 .708.708L11.707 8l1.647 1.646a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2zM2 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                            </svg>
                        </Link>
                    </div>
                    <div>
                        <ul className="list-unstyled d-flex align-items-center mb-0 ms-5 ms-lg-0">
                            <li className="dropdown-center">
                                <Link className="position-relative btn-icon btn-ghost-secondary btn rounded-circle" to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="bi bi-bell fs-5"></i>

                                </Link>
                                <div className="dropdown-menu dropdown-menu-end dropdown-menu-lg p-0 border-0">
                                    <div className="border-bottom p-5 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-1">Notifications</h5>
                                            <p className="mb-0 small">There are no notifications to read.</p>
                                        </div>
                                        <Link to="#!" className="btn btn-ghost-secondary btn-icon rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Mark all as read">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-check2-all text-success" viewBox="0 0 16 16">
                                                <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z" />
                                                <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </li>
                            <li className="dropdown ms-4">
                                <Link to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <img 
                                        src={getProfileImageUrl(adminDetails?.image)} 
                                        alt={adminDetails?.fullName || "Admin"} 
                                        className="avatar avatar-md rounded-circle" 
                                    />
                                </Link>
                                <div className="dropdown-menu dropdown-menu-end p-0">
                                    <div className="lh-1 px-5 py-4 border-bottom">
                                        <h5 className="mb-1 h6">{adminDetails?.fullName || 'Admin Name'}</h5>
                                        <small>{adminDetails?.employeeId || 'Employee ID'}</small>
                                    </div>
                                    <div className="border-top px-5 py-3">
                                        <button onClick={handleLogout} className="btn btn-link p-0 text-decoration-none text-danger">
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;