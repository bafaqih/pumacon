import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import api from '../services/api';
import { Alert, Button, Offcanvas, Table } from 'react-bootstrap';

const Customers = () => {
    const navigate = useNavigate();
    const { token, logout } = useAuth();

    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState(null); 
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [loadingOffcanvas, setLoadingOffcanvas] = useState(false);

    const backendAssetBaseUrl = 'http://localhost:8080';
    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/assets/images/avatar/default-avatar.png';
        if (imagePath.startsWith('http')) return imagePath;
        return `${backendAssetBaseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
    };
    const formatPrice = (price) => {
        if (price === null || price === undefined) return 'Rp -';
        return `Rp${Number(price).toLocaleString('id-ID')}`;
    };
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
        } catch (e) { return dateString; }
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) { return dateString; }
    };

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/admin/customers', { headers: { Authorization: `Bearer ${token}` } });
            setCustomers(response.data.customers || []);
        } catch (err) {
            console.error("Error fetching customers:", err.response || err);
            setError(err.response?.data?.error || "Failed to load customer list.");
            if (err.response?.status === 401) { logout(); navigate('/dashboard/login', { replace: true }); }
        } finally {
            setLoading(false);
        }
    }, [token, navigate, logout]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleViewCustomer = async (customerId) => {
        setLoadingOffcanvas(true);
        setShowOffcanvas(true);
        setError(''); 
        try {
            const response = await api.get(`/admin/customers/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedCustomer(response.data.customer_detail || null);
        } catch (err) {
            console.error(`Error fetching detail for customer ${customerId}:`, err.response || err);
            setError(`Failed to load details for customer #${customerId}.`);
            setShowOffcanvas(false);
        } finally {
            setLoadingOffcanvas(false);
        }
    };
    
    const handleCloseOffcanvas = () => setShowOffcanvas(false);

    const handleDeleteCustomer = async (customerId, customerName) => {
        if (!window.confirm(`Are you sure you want to delete customer "${customerName}"? This will delete all their associated orders and data.`)) return;
        
        setActionMessage(null);
        try {
            const response = await api.delete(`/admin/customers/${customerId}`, { headers: { Authorization: `Bearer ${token}` } });
            setActionMessage({ type: 'success', text: response.data.message || 'Customer deleted successfully!' });
            fetchCustomers();
        } catch (err) {
            console.error(`Error deleting customer ${customerId}:`, err.response || err);
            setActionMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to delete customer.' });
        }
    };

    if (loading) {
        return <main className="main-content-wrapper"><div className="container p-5 text-center">Loading customers...</div></main>;
    }
    
    return (
        <>
            <main className="main-content-wrapper">
                <div className="container">
                    <div className="row mb-8">
                        <div className="col-md-12">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                                <div>
                                    <h2>Customers</h2>
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb mb-0">
                                            <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                                            <li className="breadcrumb-item active" aria-current="page">Customers</li>
                                        </ol>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-12 col-12 mb-5">
                            <div className="card h-100 card-lg">
                                <div className="p-6">
                                    <div className="row justify-content-between">
                                        <div className="col-md-4 col-12">
                                            <form className="d-flex" role="search">
                                                <input className="form-control" type="search" id="searchCustomers" placeholder="Search Customers" />
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body p-0">
                                    {actionMessage && <div className="p-4"><Alert variant={actionMessage.type} onClose={() => setActionMessage(null)} dismissible>{actionMessage.text}</Alert></div>}
                                    {error && !actionMessage && <div className="p-4"><Alert variant="danger">{error}</Alert></div>}
                                    <div className="table-responsive">
                                        <table className="table table-centered table-hover table-borderless mb-0 table-with-checkbox text-nowrap">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th><div className="form-check"><input className="form-check-input" type="checkbox" id="checkAll" /><label className="form-check-label" htmlFor="checkAll"></label></div></th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>Spent</th>
                                                    <th>Last Purchase</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customers.length > 0 ? (
                                                    customers.map((customer) => (
                                                        <tr key={customer.customer_id}>
                                                            <td><div className="form-check"><input className="form-check-input" type="checkbox" id={`customer-${customer.customer_id}`} /><label className="form-check-label" htmlFor={`customer-${customer.customer_id}`}></label></div></td>
                                                            <td>{customer.full_name}</td>
                                                            <td>{customer.email}</td>
                                                            <td>{customer.phone || '-'}</td>
                                                            <td>{formatPrice(customer.total_spent)}</td>
                                                            <td>{formatDateTime(customer.last_purchase)}</td>
                                                            <td>
                                                                <div className="dropdown">
                                                                    <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                                                                        <i className="feather-icon icon-more-vertical fs-5"></i>
                                                                    </Link>
                                                                    <ul className="dropdown-menu">
                                                                        <li>
                                                                            <button className="dropdown-item" onClick={() => handleDeleteCustomer(customer.customer_id, customer.full_name)}>
                                                                                <i className="bi bi-trash me-3"></i>Delete
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button className="dropdown-item" onClick={() => handleViewCustomer(customer.customer_id)}>
                                                                                <i className="bi bi-eye me-3"></i>View
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="7" className="text-center p-4">No customers with orders found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="end" style={{ width: '600px' }}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Customer Details</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {loadingOffcanvas ? (
                        <p>Loading details...</p>
                    ) : selectedCustomer ? (
                        <div className="d-flex flex-column gap-4">
                            <div className="d-flex flex-row align-items-center gap-4 w-100">
                                <div className="d-flex flex-column gap-1 flex-grow-1">
                                    <h3 className="mb-0 h5">{selectedCustomer.full_name}</h3>
                                    <div className="d-md-flex align-items-center justify-content-between">
                                        <div className="">ID: {selectedCustomer.customer_id}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="border-end col-4 text-center"><span className="text-black-50 d-block">Join Date</span><span className="text-dark">{formatDate(selectedCustomer.join_date)}</span></div>
                                        <div className="border-end col-4 text-center"><span className="text-black-50 d-block">Total Spent</span><span className="text-dark">{formatPrice(selectedCustomer.total_spent)}</span></div>
                                        <div className="col-4 text-center"><span className="text-black-50 d-block">Total Orders</span><span className="text-dark">{selectedCustomer.total_orders}</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="border-bottom p-4"><h6 className="mb-0">Contact Info</h6></div>
                                <div className="card-body p-4 d-flex flex-column gap-3">
                                    <div className="d-flex flex-column gap-1"><div className="h6 mb-0">Email</div><span className="text-black-50">{selectedCustomer.email}</span></div>
                                    <div className="d-flex flex-column gap-1"><div className="h6 mb-0">Phone Number</div><span className="text-black-50">{selectedCustomer.phone || '-'}</span></div>
                                    <div className="d-flex flex-column gap-1"><div className="h6 mb-0">Birthday</div><span className="text-black-50">{formatDate(selectedCustomer.birthday) || '-'}</span></div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="border-bottom p-4"><h6 className="mb-0">Addresses</h6></div>
                                <div className="card-body p-4 d-flex flex-column gap-3">
                                    {(selectedCustomer.addresses || []).map(addr => (
                                        <address key={addr.AddressID} className={`p-2 rounded mb-0 ${addr.IsDefault ? 'bg-light' : ''}`} style={{whiteSpace: 'pre-line'}}>
                                            <strong>{addr.Title}</strong> {addr.IsDefault && <span className="badge bg-primary">Primary</span>}<br/>
                                            {addr.Street}, {addr.Additional ? addr.Additional + ',' : ''}<br/>
                                            {addr.DistrictCity}, {addr.Province} {addr.PostCode}
                                        </address>
                                    ))}
                                </div>
                            </div>
                            {Array.isArray(selectedCustomer.order_history) && selectedCustomer.order_history.length > 0 && (
                                <div className="card">
                                    <div className="border-bottom p-4"><h6 className="mb-0">Order History</h6></div>
                                    <div className="card-body py-0 px-4">
                                        <ul className="list-group list-group-flush mb-0">
                                            {selectedCustomer.order_history.map(order => (
                                                <li className="list-group-item px-0 py-3" key={order.order_id}>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <Link to={`/dashboard/orders/${order.order_id}`} className="fw-semibold text-inherit">Order #{order.order_id}</Link>
                                                        <span>{formatPrice(order.grand_total)}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <small className="text-muted">{formatDateTime(order.order_date_time)}</small>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="offcanvas-body">
                            <p>Customer details could not be loaded or no customer selected.</p>
                        </div>
                    )}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default Customers;