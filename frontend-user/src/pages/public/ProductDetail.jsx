import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";

const ProductDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

    const handleNavClick = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

	const isHome = location.pathname === "/";

  return (
	<div style={{ paddingTop: isHome ? '0px' : '100px' }}>
			<div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('public/images/banner/bnr1.jpg')"}}>
				<div className="container">
					<div className="dz-bnr-inr-entry">
						<h1>Shop Detail</h1>
						<nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
							<ul className="breadcrumb">
								<li className="breadcrumb-item"><a href="index.html">Home</a></li>
								<li className="breadcrumb-item active" aria-current="page">Shop Detail</li>
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
								<div className="dz-media">
									<img src="public/images/about/pic6.jpg" alt="image"/>
								</div>
							</div>
							<div className="col-lg-7">
								<div className="dz-content">
									<div className="dz-header">
										<h3 className="title">Think and Grow Rich</h3>
										<div className="shop-item-rating">
											<div className="d-lg-flex d-sm-inline-flex d-flex align-items-center">
												<ul className="dz-rating">
													<li><i className="fa-solid fa-star text-yellow"></i></li>	
													<li><i className="fa-solid fa-star text-yellow"></i></li>	
													<li><i className="fa-solid fa-star text-yellow"></i></li>	
													<li><i className="fa-solid fa-star text-yellow"></i></li>	
													<li><i className="fa-solid fa-star text-yellow"></i></li>	

												</ul>
												<h6 className="m-b0">4.0</h6>
											</div>
											<div className="social-area">
												<ul className="dz-social-icon style-1">
													<li><a className="btn-facebook" href="https://www.faceshop.com/dexignzone" target="_blank"><i className="fa-brands fa-facebook-f"></i></a></li>
													<li><a className="btn-twitter" href="https://twitter.com/dexignzones" target="_blank"><i className="fa-brands fa-twitter"></i></a></li>
													<li><a className="btn-whatsapp" href="https://www.whatsapp.com/" target="_blank"><i className="fa-brands fa-whatsapp"></i></a></li>
													<li><a className="btn-envelope" href="https://www.google.com/intl/en-GB/gmail/about/" target="_blank"><i className="fa-solid fa-envelope"></i></a></li>
												</ul>
											</div>
										</div>
									</div>
									<div className="dz-body">
										<div className="shop-detail">
											<ul className="shop-info">
												<li>
													<div className="writer-info">
														<img src="public/images/blog/small/pic3.jpg" alt=""/>
														<div>
															<span>Writen by</span>Kevin Smiley
														</div>
													</div>
												</li>
												<li><span>Publisher</span>Printarea Studios</li>
												<li><span>Year</span>2022</li>
											</ul>
										</div>
										<p className="text-1">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.</p>
										<p className="text-2">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem</p>
										<div className="shop-footer">
											<div className="price">
												<h5>$54.78</h5>
												<p className="p-lr10">$70.00</p>
											</div>
											<div className="product-num">
												<div className="quantity btn-quantity style-1 me-3">
													<input id="demo_vertical2" type="text" value="1" name="demo_vertical2"/>
												</div>
												<a href="shop-cart.html" className="btn btn-gray"><i className="fa-solid fa-cart-shopping"></i> <span>Add to cart</span></a>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div className="row">
					<div className="col-xl-8">
						<div className="product-description tabs-site-button">
                            <ul className="nav nav-tabs">
                                <li><a data-bs-toggle="tab" href="shop-detail.html#graphic-design-1" className="active">Details Product</a></li>
                                <li><a data-bs-toggle="tab" href="shop-detail.html#developement-1">Customer Reviews</a></li>
                            </ul>
							<div className="tab-content">
								<div id="graphic-design-1" className="tab-pane show active">
                                    <table className="table border shop-overview">
                                        <tr>
                                            <th>Shop Title</th>
                                            <td>Think and Grow Rich</td>
                                        </tr>
                                        <tr>
                                            <th>Author</th>
                                            <td>Napoleon Rich</td>
                                        </tr>
                                        <tr>
                                            <th>ISBN</th>
                                            <td>123456789 (ISBN13: 123456789)</td>
                                        </tr>
										<tr>
                                            <th>Ediiton Language</th>
                                            <td>English</td>
                                        </tr>
                                        <tr>
                                            <th>Shop Format</th>
                                            <td>Paperback, 450 Pages</td>
                                        </tr>
                                        <tr>
                                            <th>Date Published</th>
                                            <td>August 10th 2019</td>
                                        </tr>
										<tr>
                                            <th>Publisher</th>
                                            <td>Wepress Inc.</td>
                                        </tr>
										<tr>
                                            <th>Pages</th>
                                            <td>520</td>
                                        </tr>
										<tr>
                                            <th>Lesson</th>
                                            <td>7</td>
                                        </tr>
										<tr>
                                            <th>Topic</th>
                                            <td>360</td>
                                        </tr>
                                        <tr className="tags">
                                            <th>Tags</th>
                                            <td>
												<a href="javascript:void(0);" className="badge">Drama</a>
												<a href="javascript:void(0);" className="badge">Advanture</a>
												<a href="javascript:void(0);" className="badge">Survival</a>
												<a href="javascript:void(0);" className="badge">Biography</a>
												<a href="javascript:void(0);" className="badge">Trending2022</a>
												<a href="javascript:void(0);" className="badge">Bestseller</a>
											</td>
                                        </tr>
                                    </table>
                                </div>
								<div id="developement-1" className="tab-pane">
                                    <div className="clear" id="comment-list">
										<div className="post-comments comments-area style-1 clearfix">
											<h4 className="comments-title">4 COMMENTS</h4>
											<div id="comment">
												<ol className="comment-list">
													<li className="comment even thread-even depth-1 comment" id="comment-2">
														<div className="comment-body">
															<div className="comment-author vcard">
																<img src="public/images/avatar/avatar1.jpg" alt="" className="avatar"/>
																<cite className="fn">Michel Poe</cite>
																<div className="comment-meta">
																	<a href="javascript:void(0);">December 28, 2022 at 6:14 am</a>
																</div>
															</div>
															<div className="comment-content dlab-page-text">
																<p>Donec suscipit porta lorem eget condimentum. Morbi vitae mauris in leo venenatis varius. Aliquam nunc enim, egestas ac dui in, aliquam vulputate erat.</p>
															</div>
															<div className="reply">
																<a rel="nofollow" className="comment-reply-link" href="javascript:void(0);"><i className="fa fa-reply"></i> Reply</a>
															</div>
														</div>
														<ol className="children">
															<li className="comment byuser comment-author-w3itexpertsuser bypostauthor odd alt depth-2 comment" id="comment-3">
																 <div className="comment-body" id="div-comment-3">
																	<div className="comment-author vcard">
																	   <img src="public/images/avatar/avatar2.jpg" alt="" className="avatar"/>
																	   <cite className="fn">Celesto Anderson</cite>
																	   <div className="comment-meta">
																		  <a href="javascript:void(0);">December 28, 2022 at 6:14 am</a>
																	   </div>
																	</div>
																	<div className="comment-content dlab-page-text">
																	   <p>Donec suscipit porta lorem eget condimentum. Morbi vitae mauris in leo venenatis varius. Aliquam nunc enim, egestas ac dui in, aliquam vulputate erat.</p>
																	</div>
																	<div className="reply">
																	   <a className="comment-reply-link" href="javascript:void(0);"><i className="fa fa-reply"></i> Reply</a>
																	</div>
																 </div>
															  </li>
														   </ol>
														</li>
														<li className="comment even thread-odd thread-alt depth-1 comment" id="comment-4">
														   <div className="comment-body" id="div-comment-4">
															  <div className="comment-author vcard">
																<img src="public/images/avatar/avatar3.jpg" alt="" className="avatar"/>
																 <cite className="fn">Ryan</cite>
																 <div className="comment-meta">
																	<a href="javascript:void(0);">December 28, 2022 at 6:14 am</a>
																 </div>
															  </div>
															  <div className="comment-content dlab-page-text">
																 <p>Donec suscipit porta lorem eget condimentum. Morbi vitae mauris in leo venenatis varius. Aliquam nunc enim, egestas ac dui in, aliquam vulputate erat.</p>
															  </div>
															  <div className="reply">
																 <a className="comment-reply-link" href="javascript:void(0);"><i className="fa fa-reply"></i> Reply</a>
															  </div>
														   </div>
														</li>
														<li className="comment odd alt thread-even depth-1 comment" id="comment-5">
														   <div className="comment-body" id="div-comment-5">
															  <div className="comment-author vcard">
																<img src="public/images/avatar/avatar1.jpg" alt="" className="avatar"/>
																 <cite className="fn">Stuart</cite>
																 <div className="comment-meta">
																	<a href="javascript:void(0);">December 28, 2022 at 6:14 am</a>
																 </div>
															  </div>
															  <div className="comment-content dlab-page-text">
																 <p>Donec suscipit porta lorem eget condimentum. Morbi vitae mauris in leo venenatis varius. Aliquam nunc enim, egestas ac dui in, aliquam vulputate erat.</p>
															  </div>
															  <div className="reply">
																 <a rel="nofollow" className="comment-reply-link" href="javascript:void(0);"><i className="fa fa-reply"></i> Reply</a>
															  </div>
														   </div>
														</li>
													 </ol>
												  </div>
											  <div className="default-form comment-respond style-1" id="respond">
												 <h4 className="comment-reply-title" id="reply-title">LEAVE A REPLY <small> <a rel="nofollow" id="cancel-comment-reply-link" href="javascript:void(0)" style="display:none;">Cancel reply</a> </small></h4>
												 <div className="clearfix">
													<form method="post" id="comments_form" className="comment-form" novalidate>
													   <p className="comment-form-author"><input id="name" placeholder="Author" name="author" type="text" value=""/></p>
													   <p className="comment-form-email"><input id="email" required="required" placeholder="Email" name="email" type="email" value=""/></p>
													   <p className="comment-form-comment"><textarea id="comments" placeholder="Type Comment Here" className="form-control4" name="comment" cols="45" rows="3" required="required"></textarea></p>
													   <p className="col-md-12 col-sm-12 col-xs-12 form-submit">
														  <button id="submit" type="submit" className="submit btn btn-primary filled">
														  Submit Now <i className="fa fa-angle-right m-l10"></i>
														  </button>
													   </p>
													</form>
												 </div>
											  </div>
									   </div>
									</div>
									
								</div>
							</div>
						</div>
					</div>
					<div className="col-xl-4 mt-2 mt-lg-0">
						<div className="widget">
							<h4 className="widget-title">Related Product</h4>
							<div className="row">
								<div className="col-xl-12 col-lg-6">
									<div className="dz-shop-card style-5">
										<div className="dz-media">
											<img src="public/images/product/pic7.png" alt="image"/>
										</div>
										<div className="dz-content">
											<h5 className="subtitle"><a href="shop-detail.html">T-Shirt</a></h5>
											<ul className="dz-tags">
												<li>THRILLE	,</li>
												<li>DRAMA,</li>
												<li>HORROR</li>
											</ul>
											<div className="price">
												<span className="price-num">$45.4</span>
												<del>$98.4</del>
											</div>
											<a href="shop-cart.html" className="btn btn-gray btn-sm"><i className="fa-solid fa-cart-shopping"></i>Add to cart</a>
										</div>
									</div>
								</div>
								<div className="col-xl-12 col-lg-6">
									<div className="dz-shop-card style-5">
										<div className="dz-media">
											<img src="public/images/product/pic8.png" alt="image"/>
										</div>
										<div className="dz-content">
											<h5 className="subtitle"><a href="shop-detail.html">Apple IPhone 14</a></h5>
											<ul className="dz-tags">
												<li>THRILLE,</li>
												<li>DRAMA,</li>
												<li>HORROR</li>
											</ul>
											<div className="price">
												<span className="price-num">$45.4</span>
												<del>$98.4</del>
											</div>
											<a href="shop-cart.html" className="btn btn-gray btn-sm "><i className="fa-solid fa-cart-shopping"></i>Add to cart</a>
										</div>
									</div>
								</div>
								<div className="col-xl-12 col-lg-6">
									<div className="dz-shop-card style-5 mb-0">
										<div className="dz-media">
											<img src="public/images/product/pic10.png" alt="image"/>
										</div>
										<div className="dz-content">
											<h5 className="subtitle"><a href="shop-detail.html">Asus Tuf Gaming</a></h5>
											<ul className="dz-tags">
												<li>THRILLE,</li>
												<li>DRAMA,</li>
												<li>HORROR</li>
											</ul>
											<div className="price">
												<span className="price-num">$45.4</span>
												<del>$98.4</del>
											</div>
											<a href="shop-cart.html" className="btn btn-gray btn-sm "><i className="fa-solid fa-cart-shopping"></i> Add to cart</a>
										</div>
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