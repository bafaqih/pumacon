import React, { useState } from 'react';
import { Modal, Button, Form, Image, CloseButton, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

const logoPath = '/images/logo.png';

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
  
  const { login, loading, authError, clearAuthError: clearGlobalAuthError } = useCustomerAuth();
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

        if (redirectPath) {
            navigate(redirectPath, { replace: true });
            if(typeof clearRedirectPath === 'function') {
                clearRedirectPath();
            }
        }
      }
    } catch (err) {
      setLocalError(err.message || "Login gagal. Silakan coba lagi.");
      console.error("Login Modal error:", err);
    }
  };

  const handleSwitchToForgotPassword  = () => {
    if (typeof openForgotPasswordModal === 'function' ) {
        openForgotPasswordModal();
    }
  };

  const handleSwitchToRegister  = () => {
    if (typeof openRegisterModal === 'function') {
        openRegisterModal();
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
        {localError && <Alert variant="danger" onClose={() => setLocalError('')} dismissible>{localError}</Alert>}
        {authError && !localError && <Alert variant="danger" onClose={() => typeof clearGlobalAuthError === 'function' && clearGlobalAuthError()} dismissible>{authError}</Alert>} 
        <Form onSubmit={handleActualLogin}>
          <Form.Group className="mb-3" controlId="modalLoginEmail">
            <Form.Control name="email" required placeholder="Enter email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-0" disabled={loading}/>
          </Form.Group>
          <Form.Group className="mb-2" controlId="modalLoginPassword">
            <div className="position-relative">
              <Form.Control name="password" required placeholder="Enter password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: "40px" }} className="rounded-0" disabled={loading}/>
              <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", zIndex:2, color:"#999" }} aria-label={showPassword ? "Hide password" : "Show password"} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword);}}>
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