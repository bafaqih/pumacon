import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { FaAngleDown } from 'react-icons/fa';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext'; 
import apiClient from '../../services/apiClient'; 
import { Alert, Button  } from 'react-bootstrap'; 

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, isLoggedIn, triggerLoginModal, logout } = useCustomerAuth();

  // State untuk data yang diambil dari API
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  
  // State untuk UI dan error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  
  // State untuk form checkout
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [proofOfPaymentFile, setProofOfPaymentFile] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [validated, setValidated] = useState(false);

  // Fungsi helper
  const defaultProductImage = '/images/product/default-image.jpg';
  const backendAssetBaseUrl = 'http://localhost:8080';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultProductImage;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${backendAssetBaseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Rp -';
    return `Rp ${Number(price).toLocaleString('id-ID')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !token) {
        navigate('/', { state: { triggerLoginFromCheckout: true }, replace: true });
        if (typeof triggerLoginModal === 'function') {
            triggerLoginModal(location);
        }
        return;
      }
      setLoading(true);
      setError('');
      try {
        const [cartResponse, addressResponse] = await Promise.all([
          apiClient.get('/user/cart', { headers: { Authorization: `Bearer ${token}` } }),
          apiClient.get('/user/addresses', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const fetchedCartItems = cartResponse.data.cart_items || [];
        const fetchedAddresses = addressResponse.data.addresses || [];

        if (fetchedCartItems.length === 0) {
            alert("Your cart is empty. You will be redirected to the products page.");
            navigate('/products');
            return;
        }

        setCartItems(fetchedCartItems);
        setAddresses(fetchedAddresses);

        if (fetchedAddresses.length > 0) {
          setSelectedAddressId(fetchedAddresses[0].AddressID); 
        }

      } catch (err) {
        console.error("Error fetching checkout data:", err.response || err);
        setError(err.response?.data?.error || "Failed to load checkout data.");
        if (err.response && err.response.status === 401) {
            logout();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn, token, navigate, logout, location]);

  const handleProofOfPaymentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setProofOfPaymentFile(e.target.files[0]);
    } else {
        setProofOfPaymentFile(null);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);

    if (form.checkValidity() === false || !selectedAddressId || !paymentMethod) {
        e.stopPropagation();
        if (!selectedAddressId) setActionMessage({type: 'danger', text: 'Please select a shipping address.'});
        else if (!paymentMethod) setActionMessage({type: 'danger', text: 'Please select a payment method.'});
        return;
    }
    if (paymentMethod === 'Bank Transfer' && !proofOfPaymentFile) {
        setActionMessage({type: 'danger', text: 'Proof of payment is required for bank transfer.'});
        return;
    }

    setLoadingSubmit(true);
    setActionMessage(null);

    const formDataPayload = new FormData();
    const checkoutData = {
        selected_address_id: parseInt(selectedAddressId, 10),
        payment_method: paymentMethod,
        notes: notes,
    };
    formDataPayload.append('jsonData', JSON.stringify(checkoutData));

    if (proofOfPaymentFile) {
        formDataPayload.append('proofPaymentFile', proofOfPaymentFile);
    }

    try {
        const response = await apiClient.post('/user/orders', formDataPayload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert(response.data.message || 'Your order has been placed successfully!');
        navigate(`/account/orders`);
    } catch (err) {
        console.error("Error placing order:", err.response);
        setActionMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to place your order. Please try again.'});
        if (err.response && err.response.status === 401) {
            logout();
        }
    } finally {
        setLoadingSubmit(false);
    }
  };


  const subtotal = useMemo(() => 
    cartItems.reduce((acc, item) => acc + (item.RegularPrice * item.Quantity), 0),
    [cartItems]
  );
  const grandTotal = subtotal; 

  if (error) {
    return <div style={{ paddingTop: '100px' }}><div className="container p-5 text-center"><Alert variant="danger">{error}</Alert></div></div>;
  }
  
  return (
    <div style={{ paddingTop: location.pathname === "/" ? '0px' : '100px' }}>
        <div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('/images/banner/bnr1.jpg')"}}>
            <div className="container">
                <div className="dz-bnr-inr-entry">
                    <h1>Checkout</h1>
                    <nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
                        <ul className="breadcrumb">
                            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                            <li className="breadcrumb-item"><Link to="/cart">Cart</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">Checkout</li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <section className="content-inner-1">
            <div className="container">
                <form onSubmit={handleSubmitOrder} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`}>
                    <div className="row">
                        <div className="col-lg-6 m-b30">
                            <div className="widget">
                                <h4 className="widget-title">Your Order</h4>
                                <div className="table-responsive">
                                    <table className="table-bordered check-tbl">
                                        <thead className="text-center">
                                            <tr>
                                                <th>Image</th>
                                                <th>Product Name</th>
                                                <th>Quantity</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <tr key={item.CartID}>
                                                    <td className="product-item-img"><img src={getImageUrl(item.Image)} alt={item.Title} /></td>
                                                    <td className="product-item-name">{item.Title}</td>
                                                    <td className="product-qty text-center">{item.Quantity}</td>
                                                    <td className="product-price text-center">{formatPrice(item.Total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="form-group mt-4">
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        placeholder="Notes about your order (optional)"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6"> 
                            <div className="shop-form widget">
                                <h4 className="widget-title">Shipping Address</h4>
                                <div className="form-group">
                                    <select
                                        className="form-select default-select" 
                                        value={selectedAddressId}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Select your address</option>
                                        {addresses.length > 0 ? (
                                            addresses.map(addr => (
                                                <option key={addr.AddressID} value={addr.AddressID}>
                                                    {`${addr.Title} - ${addr.Street}, ${addr.DistrictCity}, ${addr.Province}, ${addr.PostCode}`}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No saved addresses found.</option>
                                        )}
                                    </select>
                                    <div className="invalid-feedback">Please select a shipping address.</div>
                                </div>
                                <Link to="/account/address" className="btn-link d-block mb-4">Manage my addresses</Link>
                                <h4 className="widget-title">Order Summary</h4>
                                <table className="table-bordered check-tbl mb-4">
                                    <tbody>
                                        <tr><td>Order Subtotal</td><td className="text-end">{formatPrice(subtotal)}</td></tr>
                                        <tr><td>Shipping</td><td className="text-end">Free Shipping</td></tr>
                                        <tr className="fw-bold"><td>Total</td><td className="product-price-total text-end">{formatPrice(grandTotal)}</td></tr>
                                    </tbody>
                                </table>

                                <h4 className="widget-title">Payment Method</h4>
                                <div className="form-group">
                                    <select
                                        className="form-select default-select"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        required
                                    >
                                        <option value="" disabled>Choose Payment Method</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                    </select>
                                    <div className="invalid-feedback">Please select a payment method.</div>
                                </div>

                                {paymentMethod === "Bank Transfer" && (
                                    <>
                                        <table className="table-bordered check-tbl m-b25">
                                            <tbody>
                                                <tr><td>Bank</td><td>Bank BCA</td></tr>
                                                <tr><td>Account Number</td><td>0391886481</td></tr>
                                                <tr><td>Account Holder</td><td>CV Putra Manunggal</td></tr>
                                            </tbody>
                                        </table>
                                        <div className="form-group">
                                            <label htmlFor="proofOfPayment" className="form-label" style={{ marginBottom: "10px", color: "#090915" }}>
                                                Upload Proof of Payment <span className="text-danger">*</span>
                                            </label>
                                            <input 
                                                type="file" 
                                                className="form-control" 
                                                id="proofOfPayment"
                                                onChange={handleProofOfPaymentChange}
                                                required 
                                            />
                                            <div className="invalid-feedback">Proof of payment is required for this payment method.</div>
                                        </div>
                                    </>
                                )}
                                
                                <div className="form-group mt-4">
                                    <Button className="btn btn-primary btnhover rounded-0 w-100" type="submit" disabled={loadingSubmit}>
                                        {loadingSubmit ? 'Placing Order...' : 'Place Order Now'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
			
		<section className="content-inner-2 border-top">
			<div className="container">
				<div className="row">
					<div className="col-xl-3 col-md-6 col-sm-6 m-b30 wow fadeInUp" data-wow-delay="0.2s">
						<div className="icon-bx-wraper style-1">
							<div className="icon-media"> 
								<img src="public/images/logo/logo1.png" alt=""/>
							</div>
							<div className="icon-content">
								<h6 className="title">Free Shipping</h6>
								<p className="text">Shipping On All Order.</p>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-md-6 col-sm-6 m-b30 wow fadeInUp" data-wow-delay="0.4s">
						<div className="icon-bx-wraper style-1">
							<div className="icon-media"> 
								<img src="public/images/logo/logo2.png" alt=""/>
							</div>
							<div className="icon-content">
								<h6 className="title">Money Guarantee</h6>
								<p className="text">30 Day Money Back</p>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-md-6 col-sm-6 m-b30 wow fadeInUp" data-wow-delay="0.6s">
						<div className="icon-bx-wraper style-1">
							<div className="icon-media"> 
								<img src="public/images/logo/logo3.png" alt=""/>
							</div>
							<div className="icon-content">
								<h6 className="title">Online Support 24/7</h6>
								<p className="text">Technical Support 24/7 </p>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-md-6 col-sm-6 m-b30 wow fadeInUp" data-wow-delay="0.8s">
						<div className="icon-bx-wraper style-1">
							<div className="icon-media"> 
								<img src="public/images/logo/logo4.png" alt=""/>
							</div>
							<div className="icon-content">
								<h6 className="title">Safe Payment</h6>
								<p className="text">Transfer a Payment </p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
		
	</div>
  );
};

export default Checkout;