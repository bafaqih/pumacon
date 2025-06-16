import React, { useState } from 'react';
import { Modal, Button, Form, Image, CloseButton, Row, Col, Alert } from 'react-bootstrap';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';

const logoPath = '/images/logo.png';

const RegisterModal = ({ show, handleClose, switchToLogin }) => { 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, loading, authError, clearAuthError } = useCustomerAuth(); 
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validated, setValidated] = useState(false);

  const handleActualRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    if (typeof clearAuthError === 'function') {
        clearAuthError();
    }
    setValidated(true); 

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      return; 
    }

    const userData = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone, 
      password: password,
    };

    try {
      const responseData = await register(userData); 
      
      setSuccessMessage(responseData.message || "Registrasi berhasil! Silakan login untuk melanjutkan.");
      setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setPassword('');
      setValidated(false);

      if (typeof switchToLogin === 'function') {
        setTimeout(() => {
            if (typeof handleClose === 'function') handleClose();
            switchToLogin(); 
        }, 2000);
      } else {
        if (typeof handleClose === 'function') handleClose();
      }

    } catch (err) {
      setLocalError(err.message || "Registrasi gagal. Silakan coba lagi.");
      console.error("Register Modal error:", err);
    }
  };

  const handleSwitchToLoginInternal = () => {
    if (typeof switchToLogin === 'function') {
      if (typeof handleClose === 'function') handleClose(); 
      switchToLogin(); 
    } else {
      console.warn("Prop 'switchToLogin' tidak tersedia di RegisterModal.");
      if (typeof handleClose === 'function') handleClose(); 
    }
  };
  
  const handleModalClose = () => {
    if (typeof handleClose === 'function') handleClose();
    setLocalError('');
    setSuccessMessage('');
    setValidated(false); 
    if (typeof clearAuthError === 'function') clearAuthError();
  };


  return (
    <Modal 
      show={show} 
      onHide={handleModalClose} 
      centered 
      dialogClassName="register-modal-dialog-custom"
      contentClassName="rounded-0" 
    >
      <Modal.Body className="p-4 p-md-5 position-relative"> 
        <CloseButton onClick={handleModalClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }} aria-label="Close" />
        <div className="text-center mb-5">
          <Image src={logoPath} alt="Logo" fluid style={{ maxHeight: '50px' }} />
        </div>
        <h4 className="mb-2">Create Your Account</h4>
        <p className="mb-4">Join us and start shopping.</p>
        
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {localError && <Alert variant="danger">{localError}</Alert>}
        {authError && !localError && <Alert variant="danger">{authError}</Alert>} 
        
        <Form onSubmit={handleActualRegister} noValidate className={validated ? 'was-validated' : ''}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="modalRegisterFirstName">
                <Form.Control name="firstName" required placeholder="First name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-0" disabled={loading}/>
                <Form.Control.Feedback type="invalid">First name is required.</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="modalRegisterLastName">
                <Form.Control name="lastName" required placeholder="Last name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-0" disabled={loading}/>
                <Form.Control.Feedback type="invalid">Last name is required.</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="modalRegisterEmail">
            <Form.Control name="email" required placeholder="Enter email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-0" disabled={loading}/>
            <Form.Control.Feedback type="invalid">Please provide a valid email.</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="modalRegisterPhone">
            <Form.Control name="phone" required placeholder="Enter phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-0" disabled={loading}/>
            <Form.Control.Feedback type="invalid">Phone number is required.</Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="modalRegisterPassword"> 
            <div className="position-relative">
              <Form.Control name="password" required placeholder="Create a password (min. 6 characters)" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: "40px" }} className="rounded-0" minLength="6" disabled={loading}/>
              <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", zIndex:2, color: "#999" }} aria-label={showPassword ? "Hide password" : "Show password"} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword);}}>
                <i className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
              </span>
              <Form.Control.Feedback type="invalid">Password must be at least 6 characters.</Form.Control.Feedback>
            </div>
          </Form.Group>

          <div className="d-grid mb-4">
            <Button variant="primary" type="submit" className="btnhover rounded-0" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </div>

          <div className="text-center">
            <small className="">Already have an account?{' '}</small>
            <Button variant="link" size="sm" onClick={handleSwitchToLoginInternal} className="text-decoration-none px-0 py-1 link-text-extra-small" disabled={loading}>
              Login
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RegisterModal;