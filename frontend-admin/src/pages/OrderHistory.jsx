import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import api from '../services/api'; 
import { Alert } from 'react-bootstrap'; 

const OrderHistory = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [allOrders, setAllOrders] = useState([]);
  const [currentDisplayOrders, setCurrentDisplayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10; 

  const defaultProductImage = '/assets/images/products/default-image.jpg'; 
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
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      }).replace(',', '');
    } catch (e) { return dateString; }
  };

  const getStatusClass = (status) => {
    if (!status) return 'bg-light-secondary text-dark-secondary';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
      case 'pending confirmation':
        return 'bg-light-warning text-dark-warning';
      case 'processed':
        return 'bg-light-info text-dark-info';
      case 'shipped':
        return 'bg-light-primary text-dark-primary';
      case 'success':
      case 'completed':
        return 'bg-light-success text-dark-success';
      case 'canceled':
        return 'bg-light-danger text-dark-danger';
      default:
        return 'bg-light-secondary text-dark-secondary';
    }
  };

  const fetchAllOrders = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/orders?status=Completed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllOrders(response.data.orders || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching all orders:", err.response || err);
      setError(err.response?.data?.error || "Failed to load Order History.");
      if (err.response?.status === 401) {
        logout();
        navigate('/dashboard/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate, logout]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  useEffect(() => {
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    setCurrentDisplayOrders(allOrders.slice(indexOfFirstOrder, indexOfLastOrder));
  }, [currentPage, allOrders, ordersPerPage]);

  const totalPages = Math.ceil(allOrders.length / ordersPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}? This action cannot be undone.`)) return;

    setError('');
    try {
      await api.delete(`/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`Order #${orderId} has been deleted.`);
      fetchAllOrders(); 
    } catch (err) {
      console.error(`Error deleting order ${orderId}:`, err.response || err);
      setError(err.response?.data?.error || `Failed to delete order #${orderId}.`);
    }
  };


  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div>
              <h2>Order History</h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/dashboard/orders" className="text-inherit">Orders</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Order History</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12 col-12 mb-5">
            <div className="card h-100 card-lg">
              <div className="p-6">
                <div className="row justify-content-between">
                  <div className="col-md-4 col-12 mb-2 mb-md-0">
                    <form className="d-flex" role="search">
                      <input className="form-control" type="search" placeholder="Search Orders" aria-label="Search" />
                    </form>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {error && <div className="p-6"><Alert variant="danger">{error}</Alert></div>}
                <div className="table-responsive">
                  <table className="table table-centered table-hover text-nowrap table-borderless mb-0 table-with-checkbox">
                    <thead className="bg-light">
                      <tr>
                        <th><div className="form-check"><input className="form-check-input" type="checkbox" id="checkAll" /><label className="form-check-label" htmlFor="checkAll"></label></div></th>
                        <th>Image</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date & Time</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDisplayOrders.length > 0 ? (
                        currentDisplayOrders.map((order, index) => {
                          return (
                            <tr key={order.order_id}>
                              <td><div className="form-check"><input className="form-check-input" type="checkbox" id={`order-${order.order_id}`} /><label className="form-check-label" htmlFor={`order-${order.order_id}`}></label></div></td>
                              <td><Link to={`/dashboard/orders/${order.order_id}`}><img src={getImageUrl(order.first_item_image)} alt={`Order ${order.order_id}`} className="icon-shape icon-md" /></Link></td>
                              <td><Link to={`/dashboard/orders/${order.order_id}`} className="text-reset">{order.order_id}</Link></td>
                              <td>{order.customer_fullname}</td>
                              <td>{formatOrderDateTime(order.order_date_time)}</td>
                              <td>{order.payment_method}</td>
                              <td><span className={`badge ${getStatusClass(order.order_status)}`}>{order.order_status}</span></td>
                              <td>{formatPrice(order.grand_total)}</td>
                              <td>
                                <div className="dropdown">
                                  <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="feather-icon icon-more-vertical fs-5"></i>
                                  </Link>
                                  <ul className="dropdown-menu">
                                    <li>
                                      <button className="dropdown-item" onClick={() => handleDeleteOrder(order.order_id)}>
                                        <i className="bi bi-trash me-3"></i>Delete
                                      </button>
                                    </li>
                                    <li>
                                      <Link className="dropdown-item" to={`/dashboard/orders/${order.order_id}`}>
                                        <i className="bi bi-pencil-square me-3"></i>Update
                                      </Link>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="9" className="text-center p-4">No orders found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="border-top d-md-flex justify-content-between align-items-center p-6">
                  <span>Showing {allOrders.length > 0 ? ((currentPage - 1) * ordersPerPage) + 1 : 0} to {Math.min(currentPage * ordersPerPage, allOrders.length)} of {allOrders.length} entries</span>
                  <nav className="mt-2 mt-md-0">
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage - 1)}>&laquo;</button>
                      </li>
                      {[...Array(totalPages).keys()].map(number => (
                        <li key={`page-${number + 1}`} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                          <button onClick={() => paginate(number + 1)} className="page-link">{number + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => paginate(currentPage + 1)}>&raquo;</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderHistory;