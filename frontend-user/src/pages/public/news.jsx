import { Link } from 'react-router-dom';
import React, { useEffect } from "react";
import { useLocation } from 'react-router-dom';
const News = () => {
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

const location = useLocation();
const isHome = location.pathname === "/";

  return (
	<div style={{ paddingTop: isHome ? '0px' : '100px' }}>
		<div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('public/images/banner/bnr1.jpg')"}}>
			<div className="container">
				<div className="dz-bnr-inr-entry">
					<h1>Latest News</h1>
					<nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
						<ul className="breadcrumb">
							<li className="breadcrumb-item"><Link to="/">Home</Link></li>
							<li className="breadcrumb-item active" aria-current="page">News</li>
						</ul>
					</nav>
				</div>
			</div>
		</div>
	

		<section className="content-inner bg-white position-relative">
			<div className="container">
				<div className="row ">
					<div className="col-xl-8 col-lg-8">
						<div className="row">
							<div className="col-lg-12 ">								
								<div className="dz-card style-1 blog-half overlay-shine wow fadeInUp" data-wow-delay="1.0s">
									<div className="dz-media">
										<a href="blog-details.html"><img src="public/images/blog/pic1.jpg" alt=""/></a>
										<a className="date" href="javascript:void(0)">14 Feb 2012</a>
									</div>
									<div className="dz-info">
										<div className="dz-meta">
											<ul>
												<li className="post-author"> <i className="fa-solid fa-user"></i> By <span className="text-primary">Kk Sharma</span></li>
												<li className="post-date"> <i className="fa-solid fa-message"></i> 24 Comments</li>
											</ul>
										</div>
										<h5 className="dz-title"><a href="blog-details.html">A Label For Woman Who Don’t Like To Be Labeled</a></h5>
										<p>A wonderful serenity has taken of my entire soul, like these.</p>
										<a href="blog-details.html" className="btn btn-gray">Read More</a>
									</div>
								</div>
							</div>
							<div className="col-lg-12">								
								<div className="dz-card style-1  blog-half overlay-shine wow fadeInUp" data-wow-delay="1.2s">
									<div className="dz-media">
										<a href="blog-details.html"><img src="public/images/blog/pic5.jpg" alt=""/></a>
										<a className="date" href="javascript:void(0)">15 Sep 2021</a>
									</div>
									<div className="dz-info">
										<div className="dz-meta">
											<ul>
												<li className="post-author"> <i className="fa-solid fa-user"></i> By <span className="text-primary">Kk Sharma</span></li>
												<li className="post-date"> <i className="fa-solid fa-message"></i> 24 Comments</li>
											</ul>
										</div>
										<h5 className="dz-title"><a href="blog-details.html">How to Start a Blog – Step by Step Guide </a></h5>
										<p>A wonderful serenity has taken of my entire soul, like these.</p>
										<a href="blog-details.html" className="btn btn-gray">Read More</a>
									</div>
								</div>
							</div>
							<div className="col-lg-12">
								<div className="dz-card style-1  blog-half overlay-shine wow fadeInUp" data-wow-delay="1.4s">
									<div className="dz-media">
										<a href="blog-details.html"><img src="public/images/blog/pic6.jpg" alt=""/></a>
										<a className="date" href="javascript:void(0)">13 Mar 2017</a>
									</div>
									<div className="dz-info">
										<div className="dz-meta">
											<ul>
												<li className="post-author"> <i className="fa-solid fa-user"></i> By <span className="text-primary">Kk Sharma</span></li>
												<li className="post-date"> <i className="fa-solid fa-message"></i> 24 Comments</li>
											</ul>
										</div>
										<h5 className="dz-title"><a href="blog-details.html">Ways to Promote Fashion Blogs </a></h5>
										<p>A wonderful serenity has taken of my entire soul, like these.</p>
										<a href="blog-details.html" className="btn btn-gray">Read More</a>
									</div>
								</div>
							</div>
							<div className="col-lg-12">
								<div className="dz-card style-1 blog-half overlay-shine wow fadeInUp" data-wow-delay="1.0s">
									<div className="dz-media">
										<a href="blog-details.html"><img src="public/images/blog/pic1.jpg" alt=""/></a>
										<a className="date" href="javascript:void(0)">14 Feb 2012</a>
									</div>
									<div className="dz-info">
										<div className="dz-meta">
											<ul>
												<li className="post-author"> <i className="fa-solid fa-user"></i> By <span className="text-primary">Kk Sharma</span></li>
												<li className="post-date"> <i className="fa-solid fa-message"></i> 24 Comments</li>
											</ul>
										</div>
										<h5 className="dz-title"><a href="blog-details.html">A Label For Woman Who Don’t Like To Be Labeled</a></h5>
										<p>A wonderful serenity has taken of my entire soul, like these.</p>
										<a href="blog-details.html" className="btn btn-gray">Read More</a>
									</div>
								</div>
							</div>
							<div className="col-xl-12 col-lg-12 m-b30 m-t30 m-lg-t10">
								<nav aria-label="Blog Pagination">
									<ul className="pagination style-2 text-center wow fadeInUp" data-wow-delay="0.8s">
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
					<div className="col-xl-4 col-lg-4">
						<aside className="side-bar sticky-top right">
							<div className="widget">
								<div className="widget-title">
									<h4 className="title">Search</h4>
								</div>
								<div className="search-bx">
									<form role="search" method="post">
										<div className="input-group">
											<input name="text" className="form-control style-1" placeholder="Search.." type="text"/>
											<span className="input-group-btn">
												<button type="submit" className="btn btn-primary sharp radius-no"><i className="fa-solid fa-magnifying-glass scale3"></i></button>
											</span>
										</div>
									</form>
								</div>
							</div>

							<div className="widget widget_categories">
								<div className="widget-title">
									<h4 className="title">Categories</h4>
								</div>
								<ul>
									<li className="cat-item"><a href="blog-list.html#">Categories(10)</a></li>
									<li className="cat-item"><a href="blog-list.html#">Education(13)</a></li>
									<li className="cat-item"><a href="blog-list.html#">Information(9)</a></li>
									<li className="cat-item"><a href="blog-list.html#">Jobs(3)</a></li>
									<li className="cat-item"><a href="blog-list.html#">Learn(12)</a></li>
									<li className="cat-item"><a href="blog-list.html#">Skill(6)</a></li>
								</ul>
							</div>

							<div className="widget recent-posts-entry">
								<div className="widget-title">
									<h4 className="title">Recent Post</h4>
								</div>
								<div className="widget-post-bx">
									<div className="widget-post clearfix">
										<div className="dz-media">
											<img src="public/images/blog/small/pic1.jpg" alt=""/>
										</div>
										<div className="dz-info">
											<h6 className="title"><a href="blog-details.html">Equipment you can count on. People you can trust.</a></h6>
											<div className="dz-meta">
												<ul>
													<li className="post-date"><a href="javascript:void(0);"> 17 May 2022</a></li>
												</ul>
											</div>
										</div>
									</div>
									<div className="widget-post clearfix">
										<div className="dz-media">
											<img src="public/images/blog/small/pic2.jpg" alt=""/>
										</div>
										<div className="dz-info">
											<h6 className="title"><a href="blog-details.html">Advanced Service Functions by Air Transport</a></h6>
											<div className="dz-meta">
												<ul>
													<li className="post-date"><a href="javascript:void(0);"> 07 Jan, 2022</a></li>
												</ul>
											</div>
										</div>
									</div>
									<div className="widget-post clearfix">
										<div className="dz-media">
											<img src="public/images/blog/small/pic3.jpg" alt=""/>
										</div>
										<div className="dz-info">
											<h6 className="title"><a href="blog-details.html">Proper arrangement for keeping the goods in the warehouse</a></h6>
											<div className="dz-meta">
												<ul>
													<li className="post-date"><a href="javascript:void(0);"> 25 Aug, 2022</a></li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="widget widget_tag_cloud">
								<div className="widget-title">
									<h4 className="title">Popular Tags</h4>
								</div>
								<div className="tagcloud">
									<a href="javascript:void(0);">General</a>
									<a href="javascript:void(0);">Payment</a>
									<a href="javascript:void(0);">Jobs </a>
									<a href="javascript:void(0);">Application</a>
									<a href="javascript:void(0);">Work</a>
									<a href="javascript:void(0);">Recruiting</a>
									<a href="javascript:void(0);">Income</a>
									<a href="javascript:void(0);">Employer</a>
								</div>
							</div>
						</aside>
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

export default News;