import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import apiClient from '../../services/apiClient'; 
import { Alert, Button } from 'react-bootstrap'; 

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, isLoggedIn, triggerLoginModal, currentUser, logout } = useCustomerAuth(); 

  const [cartItems, setCartItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(null); 
  const [itemLoading, setItemLoading] = useState({});

  const defaultProductImage = '/images/product/default-image.jpg';
  const backendAssetBaseUrl = 'http://localhost:8080';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultProductImage;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${backendAssetBaseUrl}/${cleanPath}`;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Rp -';
    return `Rp${Number(price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const fetchCartItems = useCallback(async () => {
    if (!isLoggedIn || !token) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/user/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = response.data.cart_items || [];
      setCartItems(items);
    } catch (err) {
      console.error("Error fetching cart items:", err.response || err);
      setError(err.response?.data?.error || "Failed to load cart items.");
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login', { state: { from: location, triggerLoginModal: true } });
      }
    } finally {
      setLoading(false);
    }
  }, [token, isLoggedIn, navigate, location, logout]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  
  const handleQuantityUpdate = async (cartId, productSku, currentTitle, newQuantity) => {
    if (newQuantity < 1) { 
      handleRemoveItem(cartId, currentTitle);
      return;
    }

    setItemLoading(prev => ({ ...prev, [cartId]: true }));
    setActionMessage(null);
    try {
      const response = await apiClient.put(`/user/cart/${cartId}`, { quantity: newQuantity }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionMessage({ type: 'success', text: response.data.message || `Quantity for "${currentTitle}" updated!` });
      fetchCartItems(); 
    } catch (err) {
      console.error("Error updating quantity for cart item " + cartId + ":", err.response || err);
      setActionMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to update quantity.' });
      if (err.response && err.response.status === 401) {
        logout(); navigate('/login', { state: { from: location }, replace: true });
      }
    } finally {
      setItemLoading(prev => ({ ...prev, [cartId]: false }));
    }
  };

  const incrementQuantity = (cartItem) => {
    handleQuantityUpdate(cartItem.CartID, cartItem.ProductSKU, cartItem.Title, cartItem.Quantity + 1);
  };

  const decrementQuantity = (cartItem) => {
    handleQuantityUpdate(cartItem.CartID, cartItem.ProductSKU, cartItem.Title, cartItem.Quantity - 1);
  };

  const handleRemoveItem = async (cartId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from your cart?`)) return;

    setItemLoading(prev => ({ ...prev, [cartId]: true }));
    setActionMessage(null);
    try {
      await apiClient.delete(`/user/cart/${cartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionMessage({ type: 'success', text: `"${productName}" removed from cart.` });
      fetchCartItems();
    } catch (err) {
      console.error("Error removing item " + cartId + ":", err.response || err);
      setActionMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to remove item.' });
      if (err.response && err.response.status === 401) {
        logout(); navigate('/login', { state: { from: location }, replace: true });
      }
    } finally {
      setItemLoading(prev => ({ ...prev, [cartId]: false }));
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.RegularPrice * item.Quantity), 0);


  return (
    <div style={{ paddingTop: location.pathname === "/" ? '0px' : '100px' }}>
      <div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('/images/banner/bnr1.jpg')" }}>
        <div className="container">
          <div className="dz-bnr-inr-entry">
            <h1>My Cart</h1>
            <nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Cart</li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="content-inner-1">
        <div className="container">
          {actionMessage && <Alert variant={actionMessage.type} onClose={() => setActionMessage(null)} dismissible>{actionMessage.text}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {!isLoggedIn && !loading && (
            <div className="text-center py-5">
              <h2>Your Cart is Empty</h2>
              <p>Please <button className="btn btn-link p-0" onClick={() => triggerLoginModal ? triggerLoginModal(location) : navigate('/login')}>login</button> to view or add items to your cart.</p>
              <Link to="/products" className="btn btn-primary rounded-0">Shop Now</Link>
            </div>
          )}

          {isLoggedIn && !loading && cartItems.length === 0 && (
            <div className="text-center py-5">
              <h2>Your Cart is Empty</h2>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link to="/products" className="btn btn-primary rounded-0">Continue Shopping</Link>
            </div>
          )}

          {isLoggedIn && !loading && cartItems.length > 0 && (
            <>
              <div className="row">
                <div className="col-lg-12 m-b30">
                  <div className="table-responsive">
                    <table className="table check-tbl table-responsive-md">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Price</th>
                          <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Quantity</th>
                          <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Total</th>
                          <th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <tr key={item.CartID}> 
                            <td className="product-item-img">
                              <Link to={`/products/${item.ProductSKU}`}>
                                <img 
                                  src={getImageUrl(item.Image)} 
                                  alt={item.Title}             
                                  style={{ width: '70px', height: 'auto', objectFit: 'contain' }}
                                  onError={(e) => { e.target.onerror = null; e.target.src=defaultProductImage; }}
                                />
                              </Link>
                            </td>
                            <td className="product-item-name">
                              <Link to={`/products/${item.ProductSKU}`}>{item.Title}</Link>
                            </td>
                            <td className="product-item-price" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              {formatPrice(item.RegularPrice)} 
                            </td>
                            <td className="product-item-quantity text-center align-middle">
                              <div className="quantity btn-quantity style-1 d-inline-flex align-items-center justify-content-center">
                                <button 
                                  onClick={() => decrementQuantity(item)} 
                                  className="btn btn-sm btn-light" 
                                  disabled={itemLoading[item.CartID] || item.Quantity <= 1}
                                >-</button>
                                <input
                                  type="number"
                                  value={item.Quantity}
                                  onChange={(e) => handleManualQuantityChange(item, e.target.value)}
                                  onBlur={(e) => { 
                                    const val = parseInt(e.target.value, 10);
                                    if (isNaN(val) || val < 1) {
                                      handleQuantityUpdate(item.CartID, item.ProductSKU, item.Title, 1); 
                                    }
                                  }}
                                  className="form-control text-center mx-1"
                                  style={{ width: '60px', MozAppearance: 'textfield' }}
                                  min="1"
                                  disabled={itemLoading[item.CartID]}
                                />
                                <button 
                                  onClick={() => incrementQuantity(item)} 
                                  className="btn btn-sm btn-light"
                                  disabled={itemLoading[item.CartID]}
                                >+</button>
                              </div>
                            </td>
                            <td className="product-item-totle" style={{ textAlign: 'center', verticalAlign: 'middle' }}>                         
                              {formatPrice(item.Total)} 
                            </td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleRemoveItem(item.CartID, item.Title)} 
                                title="Remove Item"
                                disabled={itemLoading[item.CartID]}
                              >
                                {itemLoading[item.CartID] ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-trash"></i>}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="row m-t20 justify-content-end">
                <div className="col-lg-4 m-b30">
                  <div className="widget">
                    <table className="table-bordered check-tbl m-b25 w-100">
                      <tbody>
                        <tr>
                          <td>Order Subtotal</td>
                          <td className="text-end">{formatPrice(subtotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="form-group m-b25 d-grid">
                      <Link to="/checkout" className="btn btn-primary btnhover rounded-0">
                        Proceed to Checkout
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
		
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

export default Cart;