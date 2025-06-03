import { Link } from 'react-router-dom';
import React, { useEffect } from "react";

const Error404 = () => {
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="text-center">
        <h1 className="error-text text-primary">404</h1>
        <h4>The page you were looking for is not found!</h4>
        <p>You may have mistyped the address or the page may have moved.</p>
        <Link className="btn btn-primary mt-3" to="/">Back to Home</Link>
      </div>
    </div>
  );
};

export default Error404;