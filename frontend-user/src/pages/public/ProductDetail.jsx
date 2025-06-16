import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import apiClient from '../../services/apiClient';
import { Carousel, Alert, Button, Form, Card, Row, Col } from 'react-bootstrap';

const ProductDetail = () => {
  const { productSKU: productSKUFromParam, logout  } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isLoggedIn, triggerLoginModal } = useCustomerAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) { return dateString; }
  };
  
  const getProductStatusClass = (status) => {
    if (!status) return 'bg-light-secondary text-dark-secondary';
    if (status.toLowerCase() === 'published') {
      return 'bg-light-success text-dark-success';
    } else if (status.toLowerCase() === 'unpublished') {
      return 'bg-light-danger text-dark-danger';
    }
    return 'bg-light-info text-dark-info';
  };


  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!productSKUFromParam) {
        setError("Product SKU not provided in URL.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get(`/products/${productSKUFromParam}`);
        console.log("Product Detail API Response:", response.data);
        const productData = response.data.product; 
        if (productData) {
            setProduct(productData);
        } else {
            setError(`Product with SKU ${productSKUFromParam} not found.`);
            setProduct(null);
        }
      } catch (err) {
        console.error(`Error fetching product detail for SKU ${productSKUFromParam}:`, err.response || err);
        setError(err.response?.data?.error || `Failed to load product details for SKU ${productSKUFromParam}.`);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();

    if (window.WOW) {
      new window.WOW({ live: false }).init();
    }
  }, [productSKUFromParam]);

  const handleQuantityChange = (e) => {
    let newQuantity = parseInt(e.target.value, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    } else if (product && product.stock !== undefined && newQuantity > product.stock) {
      newQuantity = product.stock;
    }
    setQuantity(newQuantity);
  };

  const incrementQuantity = () => {
    setQuantity(prevQuantity => {
      const newQuantity = prevQuantity + 1;
      return product && product.stock !== undefined && newQuantity > product.stock ? product.stock : newQuantity;
    });
  };

  const decrementQuantity = () => {
    setQuantity(prevQuantity => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleAddToCart = async () => { 
    if (!product || !product.product_sku) { 
        console.error("Product data or SKU is missing for add to cart.");
        return;
    }

    console.log(`Attempting to add to cart: ${product.title}, SKU: ${product.product_sku}, Quantity: ${quantity}`); 
    if (!isLoggedIn) {
      if (typeof triggerLoginModal === 'function') {
        triggerLoginModal(location); 
      } else {
        navigate('/login');
      }
      return;
    }

  
    const payload = {
      product_sku: product.product_sku, 
      quantity: quantity, 
    };

    try {
    

      const response = await apiClient.post('/user/cart', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Add to cart response:', response.data);
      alert(response.data.message || `${product.title} added to cart!`); 


    } catch (err) {
      console.error("Error adding to cart:", err.response || err);
      const errorMessage = err.response?.data?.error || "Failed to add product to cart. Please try again.";
      alert(errorMessage); 
       if (err.response && err.response.status === 401) {
        logout(); navigate('/login', {replace: true});
      }
    } finally {
    }
  };

  
  if (error) return <div className="container p-5 text-center"><Alert variant="danger">{error}</Alert><Link to="/products" className="btn btn-primary mt-3">Back to Products</Link></div>;
  if (!product) return <div className="container p-5 text-center"><h2>Product Not Found</h2><Link to="/products" className="btn btn-primary mt-3">Back to Products</Link></div>;

  const mainImage = (Array.isArray(product.images) && product.images.length > 0) ? getImageUrl(product.images[0]) : defaultProductImage;
  const galleryImages = Array.isArray(product.images) ? product.images : [];

  return (
	<div style={{ paddingTop: location.pathname === "/" ? '0px' : '100px' }}>
		  <div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('/images/banner/bnr1.jpg')" }}>
			<div className="container">
			  <div className="dz-bnr-inr-entry">
				<h1>Product Catalog</h1>
				<nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
				  <ul className="breadcrumb">
					<li className="breadcrumb-item"><Link to="/">Home</Link></li>
					<li className="breadcrumb-item"><Link to="/products">Products</Link></li>
                	<li className="breadcrumb-item active" aria-current="page">{product.title || 'Product Detail'}</li>
				  </ul>
				</nav>
			  </div>
			</div>
		  </div>
	
		<section className="content-inner-1">
        <div className="container">
          <div className="row shop-grid-row style-4 m-b60">
            <div className="col">
              <div className="dz-box row">
                <div className="col-lg-5">
                  <div className="dz-media mb-4">
                    <img 
                        src={mainImage} 
                        alt={product.title || "Product Image"}
                        onError={(e) => { e.target.onerror = null; e.target.src=defaultProductImage; }}
                        style={{width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', border: '1px solid #eee'}}
                    />
                  </div>
                  {galleryImages.length > 1 && (
                    <div className="d-flex flex-wrap gap-2">
                        {galleryImages.map((imgUrl, index) => (
                            <img 
                                key={index}
                                src={getImageUrl(imgUrl)}
                                alt={`${product.title} thumbnail ${index + 1}`}
                                style={{width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #ddd'}}                                
                            />
                        ))}
                    </div>
                  )}
                </div>
                <div className="col-lg-7">
                  <div className="dz-content">
                    <div className="dz-header">
                      <h3 className="title">{product.title || "Product Title"}</h3>
                    </div>
                    <div className="dz-body">
                      <div className="mb-3 product-full-description" style={{ whiteSpace: 'pre-line' }}>
                        {product.descriptions ? 
                            ( <div className="description-content" dangerouslySetInnerHTML={{ __html: product.descriptions }} /> ) 
                            : 'No description available.'
                        }
                      </div>
                      <div className="shop-footer">
                        <div className="price mb-3">
                          <h5 className="text-primary">{formatPrice(product.regular_price)}</h5>
                        </div>
                        <div className="product-num d-flex align-items-center">
                          <div className="quantity me-3">
							<input 
								id="productQuantity" 
								type="number"
								className="form-control quantity-input text-center"
								style={{ width: '90px', height:'50px'}}
								value={quantity} 
								name="productQuantity"
								onChange={handleQuantityChange}
								min="1"
								max={product.stock > 0 ? product.stock : 1}
								disabled={product.stock === 0}
							/>
							</div>
                          <Button 
                            variant="primary" 
                            className="btnhover rounded-0" 
                            onClick={handleAddToCart}
                            disabled={!product || product.stock === 0}
                          >
                            <i className="fa-solid fa-cart-shopping me-2"></i> 
                            <span>{(!product || product.stock === 0) ? 'Out of Stock' : 'Add to Cart'}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row mt-5"> 
            <div className="col-xl-8"> 
              <div className="product-description tabs-site-button">
                <ul className="nav nav-tabs">
                  <li><a data-bs-toggle="tab" href="#product-details-tab" className="active">Product Details</a></li>
                  
                </ul>
                <div className="tab-content pt-1"> 
                  <div id="product-details-tab" className="tab-pane show active">
                    <table className="table border shop-overview">
                      <tbody>
                        {product.stock !== undefined && ( 
                            <tr><th>Stock</th><td>{product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}</td></tr>
                        )}
                        {product.brand && <tr><th>Brand</th><td>{product.brand}</td></tr>}
                        <tr><th>Category</th><td>{product.category_name || '-'}</td></tr>
                        {product.power_source && <tr><th>Power Source</th><td>{product.power_source}</td></tr>}
                        {product.warranty_period && <tr><th>Warranty Period</th><td>{product.warranty_period}</td></tr>}
                        {product.production_date && <tr><th>Production Date</th><td>{formatDate(product.production_date)}</td></tr>}
                        
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default ProductDetail;