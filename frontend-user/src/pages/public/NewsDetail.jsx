import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";

const NewsDetail = () => {
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
		<div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('public/images/banner/bnr3.jpg')"}}>
			<div className="container">
				<div className="dz-bnr-inr-entry">
					<h1>Blog Details</h1>
					<nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
						<ul className="breadcrumb">
							<li className="breadcrumb-item"><a href="index.html">Home</a></li>
							<li className="breadcrumb-item active" aria-current="page">Blog Details</li>
						</ul>
					</nav>
				</div>
			</div>
		</div>
				
		<section className="content-inner position-relative" style="background: white;">
			<div className="container">
				<div className="row ">
					<div className="col-xl-8 col-lg-8">
						<div className="blog-single pt-20 sidebar dz-card">
							<div className="dz-media dz-media-rounded rounded">
								<img src="public/images/blog/large/pic1.jpg" alt=""/>
							</div>
							<div className="dz-info m-b30">
								<div className="dz-meta">
									<ul>
										<li className="post-author">
											<a href="javascript:void(0);">
												<img src="public/images/avatar/avatar3.jpg" alt="" /> 
												<span>By Jone Doe</span>
											</a>
										</li>
										<li className="post-date"><a href="javascript:void(0);"> 17 May 2022</a></li>
										<li className="post-comment"><a href="javascript:void(0);">3 comment</a></li>
									</ul>
								</div>
								<h3 className="dz-title">We Merge Fashion</h3>
								<div className="dz-post-text">
									<p>Please make sure you understand what rights you are claiming before you submit a DMCA takedown notice because it is a serious legal document. Consider whether you need legal advice. It's really important not to make false claims as this could have serious legal consequences.</p>
									<p>penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer tristique elit lobortis purus bibendum, quis dictum metus mattis. Phasellus posuere felis sed eros porttitor mattis. Curabitur massa magna, tempor in blandit id, porta in ligula. Aliquam laoreet nisl massa, at interdum mauris sollicitudin et.Harvel is a copyright protection platform for next-gen creators, crawling the web on a daily basis in order to find piracy links and copyright infringement of your content. Ip/</p>
									<blockquote className="block-quote  style-1">
										<p>“As the capability to create typography has become ubiquitous, the application of principles and best practices developed over generations of skilled workers and professionals has diminished. Ironically, at a time when scientific techniques.”</p>
										<cite>MotaAdmin</cite>
									</blockquote>
									<p>Phasellus enim magna, varius et commodo ut, ultricies vitae velit. Ut nulla tellus, eleifend euismod and pellentesque vel, sagittis vel justo. In libero urna, venenatis sit amet ornare non, suscipit nec risus. Sed consequat justo non mauris pretium at tempor justo sodales.</p>
									<ul className="m-b30">
										<li>Equipment you can count on. People you can trust.</li>
										<li>Advanced Service Functions by Air Transport</li>
										<li>Proper arrangement for keeping the goods in the warehouse</li>
									</ul>
									<p>The inner sanctuary, I throw myself down among the tall grass by the trickling stream; and, as I lie close to the earth, a thousand unknown plants are noticed by me: when I hear the buzz of the little world among the stalks, and grow familiar with the countless indescribable forms of the insects and flies, then I feel the presence of the Almighty.</p>
								</div>
								<div className="dz-share-post">
									<div className="post-tags">
									<h6 className="m-b0 m-r10 d-inline">Tags:</h6>
										<a href="javascript:void(0);">Corporate</a>
										<a href="javascript:void(0);">Blog</a>
										<a href="javascript:void(0);">Marketing</a>
									</div>
									<div className="dz-social-icon dark">
										<ul>
											<li><a target="_blank" className="fab fa-facebook-f" href="https://www.facebook.com/dexignzone/"></a></li>
											<li><a target="_blank" className="fab fa-instagram" href="https://www.instagram.com/dexignzone/"></a></li>
											<li><a target="_blank" className="fab fa-twitter" href="https://twitter.com/dexignzones"></a></li>
											<li><a target="_blank" className="fab fa-youtube" href="https://www.youtube.com/channel/UCGL8V6uxNNMRrk3oZfVct1g"></a></li>
										</ul>
									</div>									
								</div>
							</div>
						</div>
						
						<div className="widget-title">
							<h4 className="title">Related Blog</h4>
						</div>
						<div className="row m-b30 m-sm-b10">
							<div className="col-md-6 col-xl-6 m-b30">
								<div className="dz-card style-1 overlay-shine wow fadeInUp" data-wow-delay="1.0s">
									<div className="dz-media">
										<a href="blog-details.html"><img src="public/images/blog/pic2.jpg" alt=""/></a>
										<a className="date" href="javascript:void(0)">12 jun 2015</a>
									</div>
									<div className="dz-info">
										<div className="dz-meta">
											<ul>
												<li className="post-author"> <i className="fa-solid fa-user"></i> By <span className="text-primary">Kk Sharma</span></li>
												<li className="post-date"> <i className="fa-solid fa-message"></i> 24 Comments</li>
											</ul>
										</div>
										<h5 className="dz-title"><a href="blog-details.html">Writing a Fashion Blog: Beauty & Style</a></h5>
										<p>A wonderful serenity has taken of my entire soul, like these.</p>
										<a href="blog-details.html" className="btn btn-gray">Read More</a>
									</div>
								</div>
							</div>
							<div className="col-md-6 col-xl-6 m-b30">
								<div className="dz-card style-1 overlay-shine wow fadeInUp" data-wow-delay="1.0s">
									<div className="dz-media">
										<a href="blog-details.html"><img src="public/images/blog/pic3.jpg" alt=""/></a>
										<a className="date" href="javascript:void(0)">25 Aug 2018</a>
									</div>
									<div className="dz-info">
										<div className="dz-meta">
											<ul>
												<li className="post-author"> <i className="fa-solid fa-user"></i> By <span className="text-primary">Kk Sharma</span></li>
												<li className="post-date"> <i className="fa-solid fa-message"></i> 24 Comments</li>
											</ul>
										</div>
										<h5 className="dz-title"><a href="blog-details.html">30 Blog Post Ideas for Fashion Bloggers</a></h5>
										<p>A wonderful serenity has taken of my entire soul, like these.</p>
										<a href="blog-details.html" className="btn btn-gray">Read More</a>
									</div>
								</div>
							</div>
						</div>
						<div className="clear" id="comment-list">
							<div className="comments-area" id="comments">
								<div className="widget-title style-1">
									<h4 className="title">Comments</h4>
								</div>
								<div className="clearfix">
									<ol className="comment-list">
										<li className="comment">
											<div className="comment-body">
												<div className="comment-author vcard"> 
													<img  className="avatar photo" src="public/images/avatar/avatar1.jpg" alt=""/> 
													<cite className="fn">Celesto Anderson</cite>
												</div>
												<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
												<div className="reply"> 
													<a href="javascript:void(0);" className="comment-reply-link"><i className="fa fa-reply"></i>Reply</a>
												</div>
											</div>
											<ol className="children">
												<li className="comment odd parent">
													<div className="comment-body">
														<div className="comment-author vcard"> 
															<img  className="avatar photo" src="public/images/avatar/avatar2.jpg" alt=""/> 
															<cite className="fn">Jake Johnson</cite>
														</div>
														<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
														<div className="reply"> 
															<a href="javascript:void(0);" className="comment-reply-link"><i className="fa fa-reply"></i>Reply</a>
														</div>
													</div>
												</li>
											</ol>
										</li>
										<li className="comment">
											<div className="comment-body">
												<div className="comment-author vcard"> 
													<img  className="avatar photo" src="public/images/avatar/avatar3.jpg" alt=""/> 
													<cite className="fn">John Doe</cite> 
												</div>
												<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
												<div className="reply"> 
													<a href="javascript:void(0);" className="comment-reply-link"><i className="fa fa-reply"></i>Reply</a>
												</div>
											</div>
										</li>
										<li className="comment">
											<div className="comment-body">
												<div className="comment-author vcard"> 
													<img  className="avatar photo" src="public/images/avatar/avatar1.jpg" alt=""/> 
													<cite className="fn">Celesto Anderson</cite> 
												</div>
												<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
												<div className="reply"> 
													<a href="javascript:void(0);" className="comment-reply-link"><i className="fa fa-reply"></i>Reply</a>
												</div>
											</div>
										</li>
									</ol>
									
									<div className="comment-respond" id="respond">
										<div className="widget-title style-1">
											<h4 className="title" id="reply-title">Leave Your Comment
												<small><a style="display:none;" href="javascript:void(0);" id="cancel-comment-reply-link" rel="nofollow">Cancel reply</a></small>
											</h4>
										</div>
										<form className="comment-form" id="commentform" method="post">
											<p className="comment-form-author">
												<label for="author">Name <span className="required">*</span></label>
												<input type="text" name="Author"  placeholder="Author" id="author"/>
											</p>
											<p className="comment-form-email">
												<label for="email">Email <span className="required">*</span></label>
												<input type="text" placeholder="Email" name="email" id="email"/>
											</p>
											<p className="comment-form-comment">
												<label for="comment">Comment</label>
												<textarea rows="8" name="comment" placeholder="Comment" id="comment"></textarea>
											</p>
											<p className="form-submit">
												<button type="submit" className="btn btn-primary" id="submit">SUBMIT</button>
											</p>
										</form>
									</div>
								</div>
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
									<li className="cat-item"><a href="blog-details.html#">Categories(10)</a></li>
									<li className="cat-item"><a href="blog-details.html#">Education(13)</a></li>
									<li className="cat-item"><a href="blog-details.html#">Information(9)</a></li>
									<li className="cat-item"><a href="blog-details.html#">Jobs(3)</a></li>
									<li className="cat-item"><a href="blog-details.html#">Learn(12)</a></li>
									<li className="cat-item"><a href="blog-details.html#">Skill(6)</a></li>
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

export default NewsDetail;