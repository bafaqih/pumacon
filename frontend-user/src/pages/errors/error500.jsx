import { Link } from 'react-router-dom';
import React, { useEffect } from "react";

const Error500 = () => {
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="text-center">
        <h1 className="error-text text-primary">500</h1>
        <h4>Internal Server Error</h4>
        <p>You do not have permission to view this resource.</p>
        <Link className="btn btn-primary mt-3" to="/">Back to Home</Link>
      </div>
    </div>
  );
};

export default Error500;