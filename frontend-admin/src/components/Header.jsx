// Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate untuk redirect setelah logout
import { useAuth } from '../contexts/AuthContext'; // <--- 1. IMPORT useAuth (SESUAIKAN PATH)

const Header = () => {
    // --- 2. AMBIL DATA DAN FUNGSI DARI AuthContext ---
    const { adminDetails, logout, loadingDetails } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Panggil fungsi logout dari context
        navigate('/dashboard/login', { replace: true }); // Arahkan ke halaman login
    };

    // URL default jika gambar tidak ada atau path relatif
    // Pastikan Anda memiliki gambar default ini di folder public Anda atau sesuaikan pathnya
    const defaultAvatar = '/assets/images/avatar/avatar-1.jpg'; 
    // Base URL untuk gambar jika path yang disimpan di DB adalah relatif
    // Jika gambar Anda disimpan dengan URL absolut, Anda tidak memerlukan ini.
    const backendAssetBaseUrl = 'http://localhost:8080'; // Sesuaikan jika base URL backend Anda berbeda

    // Fungsi untuk mendapatkan URL gambar yang benar
    const getProfileImageUrl = (imagePath) => {
        if (!imagePath) {
            return defaultAvatar;
        }
        // Cek apakah imagePath adalah URL absolut
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // Jika path relatif, tambahkan base URL backend
        // Hapus slash di awal path jika ada, agar tidak jadi //
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        return `${backendAssetBaseUrl}/${cleanPath}`;
    };

    // Menampilkan placeholder atau pesan loading jika detail admin belum ada atau sedang dimuat
    if (loadingDetails && !adminDetails) {
        // Anda bisa menampilkan UI skeleton atau pesan loading yang lebih baik di sini
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
                        {/* Tombol Toggle Sidebar Mobile */}
                        <Link
                            className="text-inherit d-block d-xl-none me-4"
                            data-bs-toggle="offcanvas"
                            to="#offcanvasExample" // Pastikan ID ini sesuai dengan offcanvas sidebar Anda
                            role="button"
                            aria-controls="offcanvasExample"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-text-indent-right" viewBox="0 0 16 16">
                                <path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm10.646 2.146a.5.5 0 0 1 .708.708L11.707 8l1.647 1.646a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708l2-2zM2 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                            </svg>
                        </Link>
                        {/* Anda bisa menambahkan elemen lain di sini jika perlu, misal search bar */}
                    </div>
                    <div>
                        <ul className="list-unstyled d-flex align-items-center mb-0 ms-5 ms-lg-0">
                            {/* Notifikasi (tetap seperti sebelumnya, atau bisa diintegrasikan nanti) */}
                            <li className="dropdown-center">
                                <Link className="position-relative btn-icon btn-ghost-secondary btn rounded-circle" to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="bi bi-bell fs-5"></i>
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger mt-2 ms-n2">
                                        2 {/* Ini bisa diganti dengan data notifikasi dinamis nanti */}
                                        <span className="visually-hidden">unread messages</span>
                                    </span>
                                </Link>
                                <div className="dropdown-menu dropdown-menu-end dropdown-menu-lg p-0 border-0">
                                    {/* ... Konten dropdown notifikasi ... */}
                                    <div className="border-bottom p-5 d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-1">Notifications</h5>
                                            <p className="mb-0 small">You have 2 unread messages</p>
                                        </div>
                                        <Link to="#!" className="btn btn-ghost-secondary btn-icon rounded-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Mark all as read">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-check2-all text-success" viewBox="0 0 16 16">
                                                <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z" />
                                                <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
                                            </svg>
                                        </Link>
                                    </div>
                                    {/* ... Isi list notifikasi ... */}
                                </div>
                            </li>

                            {/* Profil Admin Dropdown */}
                            <li className="dropdown ms-4">
                                <Link to="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {/* --- 3. TAMPILKAN FOTO PROFIL DINAMIS --- */}
                                    <img 
                                        src={getProfileImageUrl(adminDetails?.image)} 
                                        alt={adminDetails?.fullName || "Admin"} 
                                        className="avatar avatar-md rounded-circle" 
                                    />
                                </Link>
                                <div className="dropdown-menu dropdown-menu-end p-0">
                                    <div className="lh-1 px-5 py-4 border-bottom">
                                        {/* --- 4. TAMPILKAN FULLNAME DAN EMPLOYEE ID DINAMIS --- */}
                                        <h5 className="mb-1 h6">{adminDetails?.fullName || 'Admin Name'}</h5>
                                        <small>{adminDetails?.employeeId || 'Employee ID'}</small>
                                    </div>
                                    {/* Anda bisa menambahkan link ke halaman profil admin di sini */}
                                    {/* <Link to="/dashboard/profile" className="dropdown-item">
                                        My Profile
                                    </Link> */}
                                    {/* <div className="dropdown-divider"></div> */}
                                    <div className="border-top px-5 py-3">
                                        {/* --- 5. GUNAKAN BUTTON ATAU LINK DENGAN onClick UNTUK LOGOUT --- */}
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