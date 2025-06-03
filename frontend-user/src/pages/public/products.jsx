import { Link } from 'react-router-dom';
import React, { useEffect } from "react";
import { useLocation } from 'react-router-dom';
const Products = () => {
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

const location = useLocation();
const isHome = location.pathname === "/";

  return (
	<div style={{ paddingTop: isHome ? '0px' : '100px' }}>
		<div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('public/images/banner/bnr1.jpg')" }}>
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
				<div className="row">
					<div className="site-filters style-1 clearfix title wow fadeInUp" data-wow-delay="0.1s">
						<ul className="filters justify-content-center" data-bs-toggle="buttons">
							<li className="btn active">
								<input type="radio"/>
								<a href="javascript:void(0);">All</a> 
							</li>
							<li data-filter=".Blazer" className="btn">
								<input type="radio"/>
								<a href="javascript:void(0);">Blazer</a> 
							</li>
							<li data-filter=".Shirt" className="btn">
								<input type="radio"/>
								<a href="javascript:void(0);">Shirt</a> 
							</li>
							<li data-filter=".watch" className="btn">
								<input type="radio"/>
								<a href="javascript:void(0);">watch</a> 
							</li>
							<li data-filter=".bag" className="btn">
								<input type="radio"/>
								<a href="javascript:void(0);">bag</a> 
							</li>
						</ul>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.1s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic1.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Collar Regular Fit T-Shirt</a></h6>
								<span className="price">$4.00 <del>$70.00</del></span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.2s">
						<div className="product-bx ">
							<div className="product-media">
								<img src="public/images/product/pic2.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Men's Wonder Shoes</a></h6>
								<span className="price">$8.00 <del>$12.00</del></span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic3.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Collar Regular Fit T-Shirt</a></h6>
								<span className="price">$4.00</span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.4s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic4.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Collar Regular Fit T-Shirt</a></h6>
								<span className="price">$8.00 <del>$12.00</del></span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic5.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Men's Wonder Shoes</a></h6>
								<span className="price">$8.00</span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.6s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic6.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Floral Printed Shirt</a></h6>
								<span className="price">$6.00  <del>$12.00</del></span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic7.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">T-Shirt</a></h6>
								<span className="price">$12.00</span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.8s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic8.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Apple IPhone 14</a></h6>
								<span className="price">$16.00</span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.9s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic9.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">American Tourister</a></h6>
								<span className="price">$14.00</span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="1.0s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic10.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Asus Tuf Gaming</a></h6>
								<span className="price">$6.00</span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="1.1s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic11.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Collar Casual Shirt</a></h6>
								<span className="price">$15.00</span>
							</div>		
						</div>
					</div>
					<div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="1.2s">
						<div className="product-bx">
							<div className="product-media">
								<img src="public/images/product/pic12.png" alt="image"/>
								<div className="icon">
									<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
									<a href="shop-detail.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
								</div>
								<div className="bookmark-btn style-1">
									<input className="form-check-input" type="checkbox"/>
									<label className="form-check-label">
										<i className="fa-solid fa-heart"></i>
									</label>
								</div>
							</div>
							<div className="product-content">
								<h6 className="title"><a href="shop-detail.html">Apple Watch Ultra</a></h6>
								<span className="price">$6.00</span>
							</div>		
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-xl-12 col-lg-12 m-b30 m-t30 m-lg-t10">
						<nav aria-label="Blog Pagination">
							<ul className="pagination style-1 text-center  wow fadeInUp" data-wow-delay="0.8s">
								<li className="page-item"><a className="page-link prev" href="javascript:void(0);"><i className="fas fa-chevron-left"></i></a></li>
								<li className="page-item"><a className="page-link active" href="javascript:void(0);">1</a></li>
								<li className="page-item"><a className="page-link" href="javascript:void(0);">2</a></li>
								<li className="page-item"><a className="page-link" href="javascript:void(0);">3</a></li>
								<li className="page-item"><a className="page-link next" href="javascript:void(0);"><i className="fas fa-chevron-right"></i></a></li>
							</ul>
						</nav>
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

export default Products;