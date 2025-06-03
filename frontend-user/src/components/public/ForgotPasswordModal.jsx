import React, { useState } from 'react';
import { Modal, Button, Form, Image, CloseButton } from 'react-bootstrap';

const ForgotPasswordModal = ({ show, handleClose, onSwitchToLogin, onSubmitForgotPassword }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitForgotPassword) {
      onSubmitForgotPassword(email); // Kirim email ke fungsi handler di Navbar
    }
    // Biasanya, Anda akan menutup modal setelah submit berhasil atau menampilkan pesan
    // handleClose(); // Bisa ditutup di sini atau di handler onSubmitForgotPassword
  };

  const handleBackToLoginClick = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin(); // Panggil fungsi untuk kembali ke modal login
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      dialogClassName="forgot-password-modal-dialog-custom" // Kelas kustom jika perlu
      contentClassName="rounded-0" // Modal siku
    >
      <Modal.Body className="p-4 p-md-5 position-relative"> 
        <CloseButton
            onClick={handleClose}
            style={{
                position: 'absolute',
                top: '1.5rem', 
                right: '1.5rem',
                zIndex: 10 
            }}
            aria-label="Close"
        />

        <h4 className="mb-2">Forget Password?</h4>
        <p className="mb-4">
          We will send you an email to reset your password.
        </p>
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="forgotPasswordEmail">
            <Form.Control 
              name="email" 
              required 
              placeholder="Enter your registered email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              className="rounded-0"
            />
          </Form.Group>
          
          <div className="mt-4 d-flex justify-content-start gap-2"> 
            <Button 
              variant="outline-secondary"
              className="rounded-0"
              onClick={handleBackToLoginClick}
            >
              Back
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              className="btnhover rounded-0"
            >
              Submit
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ForgotPasswordModal;