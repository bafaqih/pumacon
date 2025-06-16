import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext'; 

const logoPath = '/logo.png';
const backgrounds = [
  '/assets/images/background/bnr1.jpg',
  '/assets/images/background/bnr2.jpg',
  '/assets/images/background/bnr3.jpg',
  '/assets/images/background/bnr4.jpg',
  '/assets/images/background/bnr5.jpg',
];

const Login = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  
  const [isFocusedId, setIsFocusedId] = useState(false);
  const [isFocusedPass, setIsFocusedPass] = useState(false);

  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, authError, clearAuthError, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
    if (authError && typeof clearAuthError === 'function') {
      clearAuthError();
    }
  }, [isLoggedIn, navigate, location.state, authError, clearAuthError]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (event) => { 
    event.preventDefault();
    setLocalError(''); 
    if (typeof clearAuthError === 'function') {
      clearAuthError(); 
    }

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    try {
      await login(employeeId, password); 
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Login gagal. Silakan coba lagi.');
      console.error('Login page error:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="vh-100 w-100 d-flex">
      <div
        style={{
          width: '30%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 2,
        }}
        className="d-flex align-items-center justify-content-center position-relative"
      >
        <div className="container" style={{ maxWidth: '400px' }}>
          <div className="mb-5">
            <Link to="/">
              <img src={logoPath} alt="Logo" style={{ height: '50px' }} />
            </Link>
          </div>
          <h5 className="fs-4 fw-bold mb-1">Admin Dashboard Login</h5>
          <p className="mb-4"style={{ fontSize: '0.9rem' }}>Welcome back, please login.</p>

          {localError && <div className="alert alert-danger p-2 mb-3" role="alert" style={{fontSize: '0.85rem'}}>{localError}</div>}

          <form className="needs-validation" onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="formEmployeeId" className="form-label visually-hidden">
                Employee ID
              </label>
              <input
                type="text"
                className={`form-control ${localError && !password ? 'is-invalid' : ''}`}
                id="formEmployeeId"
                placeholder="Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onFocus={() => setIsFocusedId(true)}
                onBlur={() => setIsFocusedId(false)}
                required
                disabled={loading}
                style={{ borderRadius: 0, borderColor: isFocusedId ? '#4885ED' : '#ced4da', boxShadow: isFocusedId ? '0 0 0 0.2rem rgba(72, 133, 237, 0.25)' : 'none', }}
              />
              <div className="invalid-feedback">Please enter your Employee ID.</div>
            </div>
            <div className="mb-3 position-relative">
              <label htmlFor="formAdminLoginPassword" className="form-label visually-hidden">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${localError ? 'is-invalid' : ''}`}
                id="formAdminLoginPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsFocusedPass(true)}
                onBlur={() => setIsFocusedPass(false)}
                required
                disabled={loading} 
                style={{
                  borderRadius: 0,
                  borderColor: isFocusedPass ? '#4885ED' : '#ced4da',
                  boxShadow: isFocusedPass ? '0 0 0 0.2rem rgba(72, 133, 237, 0.25)' : 'none',
                  outline: 'none',
                }}
              />
              <span
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                <i
                  className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}
                  style={{ pointerEvents: 'none' }}
                ></i>
              </span>
              <div className="invalid-feedback">Please enter your password.</div>
            </div>

            <div className="d-grid mb-4">
              <button 
                type="submit" 
                className="btn rounded-0 fw-bold" 
                style={{ backgroundColor: '#4885ED', color: '#fff', border: 'none' }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          <p className="mt-3 mb-0" style={{ fontSize: '0.9rem' }}>
            Don’t have an admin account?{' '}
            <Link to="/dashboard/registration" style={{ color: '#4885ED', fontWeight: 600, textDecoration: 'none' }}>
              Register
            </Link>
          </p>
        </div>
      </div>    
      <div
        style={{
          width: '70%',
          backgroundImage: `url(${backgrounds[currentBackgroundIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'background-image 1s ease-in-out',
        }}
      ></div>
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.8)",
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default Login;