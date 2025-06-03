import { Link } from 'react-router-dom';
import React, { useEffect } from "react";

const Error503 = () => {
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="text-center">
        <h1 className="error-text text-primary">503</h1>
        <h4>Service Unavailable</h4>
        <p>Sorry, we are under maintenance!</p>
        <Link className="btn btn-primary mt-3" to="/">Back to Home</Link>
      </div>
    </div>
  );
};

export default Error503;