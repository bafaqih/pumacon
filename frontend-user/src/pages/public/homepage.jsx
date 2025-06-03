import { Link } from 'react-router-dom';
import React, { useEffect, useState } from "react";

const Homepage = () => {
  const backgrounds = [
    '/images/home-banner/bnr1.jpg',
    '/images/home-banner/bnr2.jpg',
    '/images/home-banner/bnr3.jpg',
    '/images/home-banner/bnr4.jpg',
    '/images/home-banner/bnr5.jpg',
  ];

   const [currentBackground, setCurrentBackground] = useState(0);

  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }

    const interval = setInterval(() => {
      setCurrentBackground((prevIndex) => (prevIndex + 1) % backgrounds.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds.length]);
  
  return (
    <div className="page-content">
      <div
        className="hero-banner"
        style={{
          backgroundImage: `url(${backgrounds[currentBackground]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "100vh",
          position: "relative",
          transition: "background-image 1s ease-in-out",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            zIndex: 1,
          }}
        />

        {/* Konten tetap */}
        <div
          className="container h-100 d-flex align-items-center"
          style={{ position: "relative", zIndex: 2 }}
        >
          <div className="row">
            <div className="col-sm-12 col-md-8">
              <h3
                className="hero-subtitle wow fadeInUp highlight-text"
                data-wow-delay="0.4s"
              >
                CV. Putra Manunggal
              </h3>
              <h1 className="hero-title wow fadeInUp" data-wow-delay="0.6s">
                PumaCon Batching Plant Dry & Wet
              </h1>
				<button
				onClick={() => {
					const section = document.getElementById("best-seller");
					section?.scrollIntoView({ behavior: "smooth" });
				}}
				className="btn btn-white btn-lg mt-4 wow fadeInUp"
				data-wow-delay="1.4s"
				>
				Explore More
				</button>
            </div>
          </div>
        </div>
      </div>		
		
		<section id="best-seller" className="content-inner overflow-hidden position-relative">
			<div className="container">
				<div className="section-head  text-center">
					<h2 className="title wow fadeInUp" data-wow-delay="0.6s">Best Seller Product</h2>
					<h6 className="text wow fadeInUp" data-wow-delay="0.8s">TOP VIEW IN THIS WEEK</h6>
				</div>
				<div className="site-filters style-1 clearfix">
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

				<div className="row align-items-cemter">
					<div className="col-xl-4 col-lg-5 col-md-12 col-sm-12 m-b30 d-sm-none d-xl-block wow fadeInLeft" data-wow-delay="0.2s">	
						<div className="product-bx product-overlay">
							<div className="dz-media">
								<img src="/public/images/about/pic1.jpg" alt="image"/>
								<Link to="/products" className="btn btn-white btn-lg wow fadeInUp" data-wow-delay="1.4s" data-swiper-parallax="-50" >Shop More</Link>
							</div>
						</div>
					</div>
					<div className="col-xl-8 col-lg-12 col-md-12 col-sm-12">	
						<ul id="masonry" className="row">
							<li className="card-container col-lg-4 col-sm-6 Fashion wow fadeInUp" data-wow-delay="0.1s">
								<div className="product-bx">
									<div className="product-media">
										<img src="/public/images/product/pic1.png" alt="image"/>
										<div className="icon">
											<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
											<a href="shop-cart.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
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
							</li>
							
							<li className="card-container col-lg-4 col-sm-6 Technology wow fadeInUp" data-wow-delay="0.2s">
								<div className="product-bx ">
									<div className="product-media">
										<img src="/public/images/product/pic2.png" alt="image"/>
										<div className="icon">
											<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
											<a href="shop-cart.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
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
							</li>
							
							<li className="card-container col-lg-4 col-sm-6 Shirt wow fadeInUp" data-wow-delay="0.3s">
								<div className="product-bx">
									<div className="product-media">
										<img src="/public/images/product/pic3.png" alt="image"/>
										<div className="icon">
											<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
											<a href="shop-cart.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
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
							</li>
							
							<li className="card-container col-lg-4 col-sm-6 watch wow fadeInUp" data-wow-delay="0.4s">
								<div className="product-bx">
									<div className="product-media">
										<img src="/public/images/product/pic4.png" alt="image"/>
										<div className="icon">
											<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
											<a href="shop-cart.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
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
							</li>
							
							<li className="card-container col-lg-4 col-sm-6 Blazer wow fadeInUp" data-wow-delay="0.5s">
								<div className="product-bx">
									<div className="product-media">
										<img src="/public/images/product/pic5.png" alt="image"/>
										<div className="icon">
											<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
											<a href="shop-cart.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
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
										<span className="price">$6.00  <del>$12.00</del></span>
									</div>		
								</div>
							</li>
							
							<li className="card-container col-lg-4 col-sm-6 bag wow fadeInUp" data-wow-delay="0.6s">
								<div className="product-bx">
									<div className="product-media">
										<img src="/public/images/product/pic6.png" alt="image"/>
										<div className="icon">
											<a href="shop-detail.html"><i className="fa-regular fa-eye"></i></a> 
											<a href="shop-cart.html"><i className="fa-solid fa-cart-arrow-down"></i></a>
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
										<span className="price">$6.00</span>
									</div>		
								</div>
							</li>
						</ul>
					</div>
				</div>
				
			</div>
		</section>	
			
		<section className="overflow-hidden position-relative">
			<div className="row g-0">
				<div className="col-lg-6">
					<div className="product-bnr style-1 bg-light-pink">
						<div className="product-media">
							<img src="/public/images/about/pic2.png" alt="image" className="wow fadeInLeft" data-wow-delay="0.2s"/>
							<div className="inner-content wow fadeInLeft" data-wow-delay="0.4s">
								<h2 className="title">The New  Collection Check Out</h2>
								<div className="clearfix">
									<a href="shop-detail.html" className="btn btn-white btn-lg">Woman Dress</a>	
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-6 row g-0">
					<div className="col-12">
						<div className="product-bnr style-2 bg-light-green">
							<div className="dz-media">
								<img src="/public/images/about/pic3.png" alt="image" className="wow fadeInUp" data-wow-delay="0.2s"/>
								<div className="inner-content wow fadeInLeft" data-wow-delay="0.4s">
									<a href="shop-detail.html" className="btn btn-white btn-lg">Best Men Outfits</a>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-6 col-md-6 col-sm-6 col-12 overflow-hidden">
						<div className="product-bnr style-3 bg-light-dark">
							<div className="dz-media">
								<img src="/public/images/about/pic4.png" alt="image" className="wow fadeIn" data-wow-delay="0.2s"/>
								<div className="inner-content wow fadeInLeft" data-wow-delay="0.4s">
									<div className="clearfix">
										<h2>60%</h2>
										<span>Sale Up to Start</span>
										<h6>Off Everything</h6>
									</div>
									<div className="clearfix">
										<Link to="/products" className="btn btn-white btn-lg wow fadeInUp" data-wow-delay="1.4s" data-swiper-parallax="-50" >Shop More</Link>
									</div>
								</div>
							</div>
						</div>	
					</div>
					<div className="col-lg-6 col-md-6 col-sm-6 col-12">
						<div className="product-bnr style-4 bg-light-blue">
							<div className="dz-media">
								<img src="/public/images/about/pic5.png" alt="image" className="wow fadeInUp" data-wow-delay="0.2s"/>
								<div className="inner-content wow fadeInLeft" data-wow-delay="0.4s">
									<a href="shop-detail.html" className="btn btn-white btn-lg">Sports Shoes</a>	
								</div>
							</div>
						</div>	
					</div>
				</div>
			</div>
		</section>
		
		<section className="content-inner overflow-hidden position-relative">
			<div className="container">
				<div className="section-head text-center">
					<h2 className="title wow fadeInUp" data-wow-delay="0.2s">LATES FROM BLOG</h2>
					<h6 className="text wow fadeInUp" data-wow-delay="0.4s">THE FRESHEST AND MOST EXCITING NEWS</h6>
				</div>
				<div className="row">
					<div className="col-lg-4 col-md-12 m-b10">
						<div className="row">
							<div className="col-lg-12 m-b20">
								<div className="blog-post-sm style-1 wow bounceInLeft" data-wow-delay="0.2s">
									<div className="dz-media">
										<img src="/public/images/blog/small/pic1.jpg" alt=""/>
									</div>
									<div className="dz-info">
										<a className="date" href="javascript:void(0)">14 Feb 2022</a>
										<h6 className="title"><a href="blog-details.html">10 Tips To Avoid Failure In E Commerce.</a></h6>
									</div>
								</div>
							</div>
							<div className="col-lg-12 m-b20">
								<div className="blog-post-sm style-1 wow bounceInLeft" data-wow-delay="0.4s">
									<div className="dz-media">
										<img src="/public/images/blog/small/pic2.jpg" alt=""/>
									</div>
									<div className="dz-info">
										<a className="date" href="javascript:void(0)">17 Aug 2019</a>
										<h6 className="title"><a href="blog-details.html">Designs That Never Goes Out Of Style</a></h6>
									</div>
								</div>
							</div>
							<div className="col-lg-12 m-b20">
								<div className="blog-post-sm style-1 wow bounceInLeft" data-wow-delay="0.6s">
									<div className="dz-media">
										<img src="/public/images/blog/small/pic3.jpg" alt=""/>
									</div>
									<div className="dz-info">
										<a className="date" href="javascript:void(0)">15 feb 2021</a>
										<h6 className="title"><a href="blog-details.html">How E Commerce Can Ease Your Pain.</a></h6>
									</div>
								</div>
							</div>
							<div className="col-lg-12 m-b20">
								<div className="blog-post-sm style-1 wow bounceInLeft" data-wow-delay="0.8s">
									<div className="dz-media">
										<img src="/public/images/blog/small/pic4.jpg" alt=""/>
									</div>
									<div className="dz-info">
										<a className="date" href="javascript:void(0)">20 Jun 2020</a>
										<h6 className="title"><a href="blog-details.html">14 Days To A Better New Collection.</a></h6>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-lg-4 col-md-12 m-b30">
						<div className="dz-card style-1 overlay-shine wow fadeInUp" data-wow-delay="0.2s">
							<div className="dz-media height-sm">
								<a href="blog-details.html"><img src="/public/images/blog/pic1.jpg" alt=""/></a>
								<a className="date" href="javascript:void(0)">14 Feb 2012</a>
							</div>
							<div className="dz-info">
								<div className="dz-meta">
									<ul>
										<li className="post-author"> <i className="fa-solid fa-user"></i> By <span className="text-primary">Kk Sharma</span></li>
										<li className="post-date"><i className="fa-solid fa-message"></i>24 Comments</li>
									</ul>
								</div>
								<h5 className="dz-title"><a href="blog-details.html">A Label For Woman Who Don’t Like To Be Labeled</a></h5>
								<p>A wonderful serenity has taken of my entire soul, like these.</p>
								<a href="blog-details.html" className="btn btn-gray">Read More</a>
							</div>
						</div>
					</div>				
					<div className="col-lg-4 col-md-12 m-b10">
						<div className="row">
							<div className="col-lg-12 m-b20">
								<div className="blog-post-sm style-1 wow bounceInRight" data-wow-delay="0.2s">
									<div className="dz-media">
										<img src="/public/images/blog/small/pic2.jpg" alt=""/>
									</div>
									<div className="dz-info">
										<a className="date" href="javascript:void(0)">17 Aug 2019</a>
										<h6 className="title"><a href="blog-details.html">Designs That Never Goes Out Of Style</a></h6>
									</div>
								</div>
							</div>
							<div className="col-lg-12 m-b20">
								<div className="blog-post-sm style-1 wow bounceInRight" data-wow-delay="0.4s">
									<div className="dz-media">
										<img src="/public/images/blog/small/pic4.jpg" alt=""/>
									</div>
									<div className="dz-info">
										<a className="date" href="javascript:void(0)">20 Jun 2020</a>
										<h6 className="title"><a href="blog-details.html">14 Days To A Better New Collection.</a></h6>
									</div>
								</div>
							</div>	
							<div className="col-lg-12 m-b20">
								<div className="blog-post-sm style-1 wow bounceInRight" data-wow-delay="0.6s">
									<div className="dz-media">
										<img src="/public/images/blog/small/pic1.jpg" alt=""/>
									</div>
									<div className="dz-info">
										<a className="date" href="javascript:void(0)">14 Feb 2022</a>
										<h6 className="title"><a href="blog-details.html">Vestibulum massa arcu,consectetu.</a></h6>
									</div>
								</div>
							</div>
							<div className="col-lg-12 m-b20">
								<div className="blog-post-sm style-1 wow bounceInRight" data-wow-delay="0.8s">
									<div className="dz-media">
										<img src="/public/images/blog/small/pic3.jpg" alt=""/>
									</div>
									<div className="dz-info">
										<a className="date" href="javascript:void(0)">15 feb 2021</a>
										<h6 className="title"><a href="blog-details.html">A Label For Woman Who Don’t Like To Be Labeled</a></h6>
									</div>
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
								<img src="/public/images/logo/logo1.png" alt=""/>
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
								<img src="/public/images/logo/logo2.png" alt=""/>
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
								<img src="/public/images/logo/logo3.png" alt=""/>
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
								<img src="/public/images/logo/logo4.png" alt=""/>
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

export default Homepage;