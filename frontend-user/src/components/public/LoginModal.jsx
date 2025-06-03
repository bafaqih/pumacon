// src/components/public/LoginModal.jsx
import React, { useState } from 'react';
import { Modal, Button, Form, Image, CloseButton, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext'; // Sesuaikan path jika perlu

const logoPath = '/images/logo.png'; // Pastikan path ini benar dari folder public Anda

const LoginModal = ({
    show,
    handleClose,
    openRegisterModal,
    openForgotPasswordModal,
    redirectPath,
    clearRedirectPath
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Dapatkan currentUser dari useCustomerAuth
    const { login, loading, authError, clearAuthError: clearGlobalAuthError, currentUser } = useCustomerAuth();
    const navigate = useNavigate();
    const [localError, setLocalError] = useState('');

    const handleActualLogin = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (typeof clearGlobalAuthError === 'function') {
            clearGlobalAuthError();
        }

        try {
            const loginSuccessful = await login({ email, password });

            if (loginSuccessful) {
                if (typeof handleClose === 'function') {
                    handleClose();
                }

                // **LOGIKA PENTING ADA DI SINI**
                // Memastikan currentUser sudah terisi setelah login berhasil.
                // Jika belum ada hasAddress di currentUser, tunggu sebentar atau pastikan fetchCustomerDetails
                // di context sudah selesai (biasanya sudah karena setToken akan memicu itu).
                // Atau lebih baik, cek currentUser langsung setelah login, karena context sudah di-update
                // di langkah sebelumnya.

                if (currentUser && currentUser.hasAddress === false) {
                    // Jika user BARU dan belum punya alamat (hasAddress: false)
                    // Arahkan ke halaman /account/address dan kirim state untuk membuka modal
                    navigate('/account/address', { state: { openAddAddressModal: true } });
                    // Tidak perlu redirectPath di sini karena sudah ada tujuan spesifik
                } else if (redirectPath) {
                    // Jika user SUDAH punya alamat (hasAddress: true) ATAU redirectPath ada
                    // Arahkan ke redirectPath yang diminta sebelumnya (misalnya dari halaman keranjang)
                    navigate(redirectPath, { replace: true });
                    if (typeof clearRedirectPath === 'function') {
                        clearRedirectPath();
                    }
                } else {
                    // Jika user sudah punya alamat DAN tidak ada redirectPath,
                    // arahkan ke halaman utama atau halaman profil default
                    // Saya ganti ke '/' atau halaman utama yang lebih umum untuk user yang sudah punya alamat
                    navigate('/'); // Atau bisa juga '/account/profile' seperti sebelumnya
                }
            }
        } catch (err) {
            setLocalError(err.message || "Login gagal. Silakan coba lagi.");
            console.error("Login Modal error:", err);
        }
    };

    const handleSwitchToForgotPassword = () => {
        if (typeof openForgotPasswordModal === 'function') {
            openForgotPasswordModal();
        } else {
            console.warn("Prop openForgotPasswordModal tidak tersedia di LoginModal");
        }
    };

    const handleSwitchToRegister = () => {
        if (typeof openRegisterModal === 'function') {
            openRegisterModal();
        } else {
            console.warn("Prop openRegisterModal tidak tersedia di LoginModal");
        }
    };

    const internalHandleClose = () => {
        if (typeof handleClose === 'function') handleClose();
        setLocalError('');
        if (typeof clearGlobalAuthError === 'function') clearGlobalAuthError();
    };

    return (
        <Modal
            show={show}
            onHide={internalHandleClose}
            centered
            dialogClassName="login-modal-dialog-custom"
            contentClassName="rounded-0"
        >
            <Modal.Body className="p-4 p-md-5 position-relative">
                <CloseButton onClick={internalHandleClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }} aria-label="Close" />
                <div className="text-center mb-5">
                    <Image src={logoPath} alt="Logo" fluid style={{ maxHeight: '50px' }} />
                </div>
                <h4 className="mb-2">Welcome back</h4>
                <p className="mb-4">If you have an account with us, please log in.</p>
                {localError && <Alert variant="danger">{localError}</Alert>}
                {authError && !localError && <Alert variant="danger">{authError}</Alert>}
                <Form onSubmit={handleActualLogin}>
                    <Form.Group className="mb-3" controlId="modalLoginEmail">
                        <Form.Control name="email" required placeholder="Enter email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-0" disabled={loading} />
                    </Form.Group>
                    <Form.Group className="mb-2" controlId="modalLoginPassword">
                        <div className="position-relative">
                            <Form.Control name="password" required placeholder="Enter password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: "40px" }} className="rounded-0" disabled={loading} />
                            <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 2, color: "#999" }} aria-label={showPassword ? "Hide password" : "Show password"} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword); }}>
                                <i className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                            </span>
                        </div>
                    </Form.Group>
                    <div className="text-start mb-3">
                        <Button variant="link" onClick={handleSwitchToForgotPassword} className="text-decoration-none px-0 py-1 fw-normal link-text-extra-small" disabled={loading}>
                            <i className="fas fa-unlock-alt me-1"></i> Forgot Password
                        </Button>
                    </div>
                    <div className="d-grid mb-4">
                        <Button variant="primary" type="submit" className="btnhover rounded-0" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </div>
                    <div className="text-center mt-3">
                        <small className="">Don’t have an account?{' '}</small>
                        <Button variant="link" size="sm" onClick={handleSwitchToRegister} className="text-decoration-none px-0 py-1 link-text-extra-small" disabled={loading}>
                            Register
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default LoginModal;