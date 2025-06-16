import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import apiClient from '../../services/apiClient';
import { Alert, Button, Card, Col, Row } from 'react-bootstrap';

const AccountOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isLoggedIn, isAuthLoading, logout } = useCustomerAuth();

  const [allOrders, setAllOrders] = useState([]);
  const [currentDisplayOrders, setCurrentDisplayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5; 

  const defaultProductImage = '/images/product/default-image.jpg'; 
  const backendAssetBaseUrl = 'http://localhost:8080';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultProductImage;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${backendAssetBaseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Rp -';
    return `Rp${Number(price).toLocaleString('id-ID')}`;
  };

  const formatOrderDateTime = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', ''); 
    } catch (e) {
      return dateString; 
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'secondary';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
      case 'pending':
        return 'secondary';
      case 'processed':
        return 'warning'; 
      case 'shipped':
        return 'info';   
      case 'success':
      case 'completed':
        return 'success'; 
      case 'canceled':
        return 'danger'; 
      default:
        return 'dark';
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/user/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllOrders(response.data.orders || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching orders:", err.response || err);
      setError(err.response?.data?.error || "Failed to load order history.");
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [token, isLoggedIn, navigate, logout]);

  useEffect(() => {
    if (!isAuthLoading && isLoggedIn) {
      fetchOrders();
    } else if (!isAuthLoading && !isLoggedIn) {
      setLoading(false);
    }
  }, [isAuthLoading, isLoggedIn, fetchOrders]);

  useEffect(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    setCurrentDisplayOrders(allOrders.slice(indexOfFirstOrder, indexOfLastOrder));
  }, [currentPage, allOrders, ordersPerPage]);

  const totalPages = Math.ceil(allOrders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading || isAuthLoading) {
    return <div className="col-lg-9 col-md-8"><p className="p-5 text-center">Loading your orders...</p></div>;
  }

  if (!isLoggedIn) {
    return (
        <div className="col-lg-9 col-md-8">
            <Alert variant="warning">
                Please <Link to="/login" state={{ from: location }}>login</Link> to see your order history.
            </Alert>
        </div>
    );
  }

  if (error) {
    return <div className="col-lg-9 col-md-8"><Alert variant="danger">{error}</Alert></div>;
  }

  return (
    <div className="col-lg-9 col-md-8">
      <div className="row g-3 mb-4 align-items-center">
        <div className="col-lg-6">
          <h1 className="mb-0 h2">Orders</h1>
        </div>
        <div className="col-lg-3 col-md-6 col-12">
          <select className="form-select" aria-label="Select Order Status">
            <option>All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processed">Processed</option>
            <option value="Shipped">Shipped</option>
            <option value="Success">Success</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
        <div className="col-lg-3 col-md-6 col-12">
          <select className="form-select" aria-label="Select Time Period">
            <option value="all-time">For all time</option>
            <option value="last-year">For last year</option>
            <option value="last-30-days">For last 30 days</option>
          </select>
        </div>
      </div>

      {currentDisplayOrders.length === 0 ? (
        <Alert variant="info">You have no orders yet.</Alert>
      ) : (
        currentDisplayOrders.map((order) => {
          if (!order || typeof order.order_id === 'undefined') {
            console.warn("Invalid order item found in list:", order);
            return null;
          }
          return (
            <div className="card mb-3 rounded-0" key={order.order_id}>
              <div className="card-header d-flex justify-content-between align-items-center px-3 py-3">
                <span className="text-dark fw-semibold">Order ID: {order.order_id}</span>
                <span className={`badge text-bg-${getStatusClass(order.order_status)}`}>{order.order_status}</span>
              </div>
              <div className="card-body px-3 py-3">
                <div className="row gy-4 align-items-center">
                  <div className="col-lg-5">
                    <div className="d-flex gap-2">
                      {(order.item_images || []).slice(0, 5).map((imgSrc, imgIndex) => (
                        <img
                          key={`img-${order.order_id}-${imgIndex}`}
                          src={getImageUrl(imgSrc)}
                          alt={`Product ${imgIndex + 1} for order ${order.order_id}`}
                          className="icon-shape icon-xl"
                          onError={(e) => { e.target.onerror = null; e.target.src=defaultProductImage; }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="col-lg-7">
                    <div className="row align-items-center gy-3 justify-content-lg-end">
                      <div className="col-lg-auto col-md-4 col-sm-6">
                        <div className="d-flex flex-column text-lg-end">
                          <span>Amount</span>
                          <span className="text-dark fw-medium">{formatPrice(order.grand_total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-white px-3 py-2 d-flex justify-content-between align-items-center">
                <small className="">
                  <i className="bi bi-clock me-1"></i>
                  {formatOrderDateTime(order.order_date_time)}
                </small>
                <Link to={`/account/orders/${order.order_id}`} className="btn btn-sm btn-outline-primary rounded-0">
                    View Details
                </Link>
              </div>
            </div>
          );
        })
      )}

      {totalPages > 1 && (
        <div className="mt-4">
          <nav aria-label="Order History Pagination">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                  &laquo;
                </button>
              </li>
              {[...Array(totalPages).keys()].map(number => (
                <li key={`page-${number + 1}`} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                  <button onClick={() => paginate(number + 1)} className="page-link">
                    {number + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default AccountOrder;