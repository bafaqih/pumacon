import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../contexts/CustomerAuthContext';
import apiClient from '../../services/apiClient';

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isLoggedIn, triggerLoginModal } = useCustomerAuth();

  const [allProducts, setAllProducts] = useState([]);
  const [currentDisplayProducts, setCurrentDisplayProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const defaultProductImage = '/images/product/default-image.jpg';
  const backendAssetBaseUrl = 'http://localhost:8080';

  const getImageUrl = (imagePathFromAPI) => { 
    if (!imagePathFromAPI) return defaultProductImage;
    if (imagePathFromAPI.startsWith('http://') || imagePathFromAPI.startsWith('https://')) return imagePathFromAPI;
    const cleanPath = imagePathFromAPI.startsWith('/') ? imagePathFromAPI.substring(1) : imagePathFromAPI;
    return `${backendAssetBaseUrl}/${cleanPath}`;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Rp -';
    return `Rp ${Number(price).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/products'); 
      console.log('API Response for /products:', response.data); 
      
      const fetchedProducts = response.data.products || [];
      const fetchedCategories = response.data.categories || [];

      console.log('Fetched Products to be set to state:', fetchedProducts);
      console.log('Fetched Categories to be set to state:', fetchedCategories);

      setAllProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setCurrentPage(1);
      setActiveCategoryFilter('all'); 
      
      if (window.WOW && fetchedProducts.length > 0) {
        setTimeout(() => { new window.WOW({ live: false, offset: 50 }).init(); }, 100);
      }
    } catch (err) {
      console.error("Error fetching public products and categories:", err.response || err);
      setError(err.response?.data?.error || "Failed to load product data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let productsToFilter = allProducts;
    if (activeCategoryFilter !== 'all') {
      productsToFilter = allProducts.filter(p => p.category_name === activeCategoryFilter);
    }
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    setCurrentDisplayProducts(productsToFilter.slice(indexOfFirstProduct, indexOfLastProduct));
  }, [currentPage, allProducts, productsPerPage, activeCategoryFilter]);

  const filteredProductsForPagination = activeCategoryFilter === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category_name === activeCategoryFilter);
  const totalPages = Math.ceil(filteredProductsForPagination.length / productsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      const productSection = document.querySelector('.content-inner .row'); 
      if (productSection) {
        const headerOffset = document.querySelector('.sticky-header.is-fixed')?.offsetHeight || 0;
        const elementTop = productSection.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: elementTop - headerOffset - 20, behavior: 'smooth' });
      }
    }
  };

  const handleCategoryFilterClick = (categoryNameToFilter) => {
    setActiveCategoryFilter(categoryNameToFilter);
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    console.log('Attempting to add to cart:', product.Title, product.ProductSKU);
    if (!isLoggedIn) {
      if(typeof triggerLoginModal === 'function') {
        triggerLoginModal(location); 
      } else {
        console.warn("triggerLoginModal function not available. Navigating to /login as fallback.");
        navigate('/login'); 
      }
      return;
    }
    alert(`Simulating: Added ${product.Title} to cart! (Backend for cart is next)`);
  };


  
  if (error) return <div className="container p-5 text-center alert alert-danger">{error}</div>;
  
  return (
    <div style={{ paddingTop: location.pathname === "/" ? '0px' : '100px' }}>
      <div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('/images/banner/bnr1.jpg')" }}>
        <div className="container">
          <div className="dz-bnr-inr-entry">
            <h1>Product Catalog</h1>
            <nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Products</li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <section className="content-inner">
        <div className="container"> 
          {Array.isArray(categories) && categories.length > 0 && (
            <div className="site-filters style-1 clearfix title wow fadeInUp" data-wow-delay="0.1s">
              <ul className="filters justify-content-center" data-bs-toggle="buttons">
                <li className={`btn ${activeCategoryFilter === 'all' ? 'active' : ''}`} onClick={() => handleCategoryFilterClick('all')}>
				<input 
					type="radio" 
					name="categoryFilter" 
					id="cat-filter-all"
					value="all"
					checked={activeCategoryFilter === 'all'}
					readOnly
					className="d-none"
				/>
				<a href="#!" onClick={(e) => e.preventDefault()}>
					All
				</a>
				</li>
                {categories.map(cat => {
                  if (!cat || typeof cat.category_id === 'undefined') { 
                    console.warn("Invalid category item during map:", cat);
                    return null; 
                  }
                  return (
                    <li 
						key={cat.category_id}
						className={`btn ${activeCategoryFilter === cat.category_name ? 'active' : ''}`}
						onClick={() => handleCategoryFilterClick(cat.category_name)} 
						>
						<input 
							type="radio" 
							name="categoryFilter"
							className="d-none"
							id={`cat-filter-${cat.category_id}`}
							value={cat.category_name}
							checked={activeCategoryFilter === cat.category_name}
							readOnly
						/>
						<a href="#!" onClick={(e) => e.preventDefault()}> 
							{cat.category_name || 'Unnamed Category'}
						</a>
				</li>
                  );
                })}
              </ul>
            </div>
          )}

          {currentDisplayProducts.length === 0 && !loading ? (
              <div className="text-center p-5 wow fadeInUp" data-wow-delay="0.2s">
                <h4>No products found {activeCategoryFilter !== 'all' ? `in "${activeCategoryFilter}"` : ''}.</h4>
                {activeCategoryFilter !== 'all' && (
                    <button className="btn btn-link" onClick={() => handleCategoryFilterClick('all')}>View All Products</button>
                )}
              </div>
          	) : (
            <div className="row mt-5">
              {currentDisplayProducts.map((product, index) => {
                if (!product || typeof product.product_sku === 'undefined') {
                    console.warn("Invalid product item during map:", product);
                    return null;
                }
                return (
                  <div 
                    className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 wow fadeInUp" 
                    key={product.product_sku} 
                    data-wow-delay={`${((index % 4) * 0.1) + 0.1}s`}
                  >
                    <div className="product-bx">
                      <div className="product-media">
                        <Link to={`/products/${product.product_sku}`}> 
                          <img 
							src={getImageUrl(product.image_url)}
							alt={product.title || "Product Image"}
							onError={(e) => { e.target.onerror = null; e.target.src = defaultProductImage }}
							style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }}
							/>
                        </Link>
                        <div className="icon">
                          <Link to={`/products/${product.product_sku}`} title="View Details" className="btn-action-view">
                              <i className="fa-regular fa-eye"></i>
                          </Link>
                        </div>
                      </div>
                      <div className="product-content">
                        <h6 className="title">
                          <Link to={`/products/${product.product_sku}`}>{product.title || "Untitled Product"}</Link>
                        </h6>
                        <span className="price">{formatPrice(product.regular_price)}</span>
                      </div>       
                  </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="row">
              <div className="col-xl-12 col-lg-12 m-b30 m-t30 m-lg-t10">
                <nav aria-label="Product Pagination">
                  <ul className="pagination style-1 text-center wow fadeInUp" data-wow-delay="0.3s">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link prev" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    {[...Array(totalPages).keys()].map(number => (
                      <li key={`page-item-${number + 1}`} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                        <button onClick={() => paginate(number + 1)} className="page-link">
                          {number + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link next" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
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

export default Products;