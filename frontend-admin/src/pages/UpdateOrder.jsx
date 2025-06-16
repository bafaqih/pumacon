import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; 
import { Alert, Button, Modal } from 'react-bootstrap';

const UpdateOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [currentStatus, setCurrentStatus] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [showProofModal, setShowProofModal] = useState(false);
  const [proofImageUrl, setProofImageUrl] = useState('');
  
  const backendAssetBaseUrl = 'http://localhost:8080';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/images/products/default-product.png'; // Fallback
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
      case 'pending': return 'bg-light-warning text-dark-warning';
      case 'processed': return 'bg-light-info text-dark-info';
      case 'shipped': return 'bg-light-primary text-dark-primary';
      case 'success':
      case 'completed': return 'bg-light-success text-dark-success';
      case 'canceled': return 'bg-light-danger text-dark-danger';
      default: return 'bg-light-secondary text-dark-secondary';
    }
  };

  const fetchOrderDetails = useCallback(async () => {
    if (!token || !orderId) {
      setError("Order ID is missing or you are not authenticated.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const details = response.data.order_detail;
      setOrderDetails(details);
      setCurrentStatus(details.order_status || '');
    } catch (err) {
      console.error("Error fetching order details:", err.response || err);
      setError(err.response?.data?.error || "Failed to load order details.");
      if (err.response?.status === 401) {
        logout(); navigate('/dashboard/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, token, navigate, logout]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleSaveChanges = async () => {
    if (!currentStatus) {
      setError("Please select a valid status.");
      return;
    }
    setLoadingUpdate(true);
    setError('');
    setSuccessMessage('');
    try {
      const payload = { order_status: currentStatus };
      await api.put(`/admin/orders/${orderId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Order status has been updated successfully!");
      fetchOrderDetails();
    } catch (err) {
      console.error("Error updating order status:", err.response || err);
      setError(err.response?.data?.error || "Failed to update order status.");
    } finally {
      setLoadingUpdate(false);
    }
  };
  
  const handleViewProof = (imageUrl) => {
    setProofImageUrl(getImageUrl(imageUrl));
    setShowProofModal(true);
  };

  if (error && !orderDetails) {
    return <main className="main-content-wrapper"><div className="container p-5"><Alert variant="danger">{error}</Alert><Link to="/dashboard/orders" className="btn btn-secondary">Back to Orders</Link></div></main>;
  }
  if (!orderDetails) { 
    return <main className="main-content-wrapper"><div className="container p-5 text-center">Order not found.</div></main>;
  }

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
              <div>
                <h2>Order Detail / Update Status</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/orders" className="text-inherit">Order List</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Order #{orderDetails.order_id}</li>
                  </ol>
                </nav>
              </div>
              <div><Link to="/dashboard/orders" className="btn btn-light">Back to all orders</Link></div>
            </div>
          </div>
        </div>

        {successMessage && <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>{successMessage}</Alert>}
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        <div className="row">
          <div className="col-xl-12 col-12 mb-5">
            <div className="card h-100 card-lg">
              <div className="card-body p-6">
                <div className="d-md-flex justify-content-between">
                  <div className="d-flex align-items-center mb-2 mb-md-0">
                    <h2 className="mb-0">Order ID: #{orderDetails.order_id}</h2>
                    <span className={`badge ms-2 ${getStatusClass(currentStatus)}`}>{currentStatus}</span>
                  </div>
                  <div className="d-md-flex align-items-center">
                    <div className="mb-2 mb-md-0">
                      <select className="form-select" value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)}>
                        <option value="Pending">Pending</option>
                        <option value="Processed">Processed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </div>
                    <div className="ms-md-3">
                      <button type="button" className="btn btn-primary" onClick={handleSaveChanges} disabled={loadingUpdate}>
                        {loadingUpdate ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="row">
                    <div className="col-lg-4 col-md-4 col-12">
                      <div className="mb-6">
                        <h6>Customer Details</h6>
                        <p className="mb-1 lh-lg">
                          {orderDetails.customer_fullname}<br />
                          <a href={`mailto:${orderDetails.customer_email}`}>{orderDetails.customer_email}</a><br />
                          {orderDetails.customer_phone}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-12">
                      <div className="mb-6">
                        <h6>Shipping Address</h6>
                        <p className="mb-1 lh-lg" style={{whiteSpace: 'pre-line'}}>
                          {orderDetails.shipping_address_snapshot}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-12">
                      <div className="mb-6">
                        <h6>Order Details</h6>
                        <p className="mb-1 lh-lg">
                          Order ID: <span className="text-dark">{orderDetails.order_id}</span><br />
                          Order Date: <span className="text-dark">{formatOrderDateTime(orderDetails.order_date_time)}</span><br />
                          Order Total: <span className="text-dark fw-bold">{formatPrice(orderDetails.grand_total)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="table-responsive mt-6">
                    <table className="table mb-0 text-nowrap table-centered">
                      <thead className="bg-light">
                        <tr>
                          <th>Products</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(orderDetails.items || []).map((item) => (
                          <tr key={item.ProductSKU}>
                            <td>
                              <Link to={`/dashboard/products/${item.product_sku}/edit`} className="text-inherit">
                                <div className="d-flex align-items-center">
                                  <div>
                                    <img src={getImageUrl(item.product_image_snapshot)} alt={item.product_title_snapshot} className="icon-shape icon-lg" />
                                  </div>
                                  <div className="ms-lg-4 mt-2 mt-lg-0">
                                    <h5 className="mb-0 h6">{item.product_title_snapshot}</h5>
                                    <small className="text-muted">SKU: {item.product_sku}</small>
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td><span className="text-body">{formatPrice(item.price_at_order)}</span></td>
                            <td>{item.quantity}</td>
                            <td className="text-end">{formatPrice(item.sub_total)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td className="border-bottom-0 pb-0"></td>
                          <td className="border-bottom-0 pb-0"></td>
                          <td colSpan="1" className="fw-medium text-dark text-end">Sub Total :</td>
                          <td className="fw-medium text-dark text-end">{formatPrice(orderDetails.subtotal)}</td>
                        </tr>
                        <tr>
                          <td className="border-bottom-0 pb-0"></td>
                          <td className="border-bottom-0 pb-0"></td>
                          <td colSpan="1" className="fw-medium text-dark text-end">Shipping Cost:</td>
                          <td className="fw-medium text-dark text-end">{formatPrice(orderDetails.shipping_cost)}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td colSpan="1" className="fw-semibold text-dark text-end">Grand Total:</td>
                          <td className="fw-semibold text-dark text-end">{formatPrice(orderDetails.grand_total)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="card-body p-6 mt-2">
                <div className="row">
                  <div className="col-md-6 mb-4 mb-lg-0">
                    <h6>Payment Info</h6>
                    <span>{orderDetails.payment_method}</span><br />
                    {orderDetails.proof_of_payment && (
                        <Button variant="link" size="sm" className="p-0" onClick={() => handleViewProof(orderDetails.proof_of_payment)}>
                            View Proof of Payment
                        </Button>
                    )}
                  </div>
                  <div className="col-md-6">
                    <h5>Notes from Customer</h5>
                    <textarea className="form-control mb-3" rows="3" 
                        value={orderDetails.notes || 'No notes provided.'}
                        readOnly 
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Modal show={showProofModal} onHide={() => setShowProofModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Proof of Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img src={proofImageUrl} alt="Proof of Payment" className="img-fluid" />
        </Modal.Body>
      </Modal>
    </main>
  );
};

export default UpdateOrder;