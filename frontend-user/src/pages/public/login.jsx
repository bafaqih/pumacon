import { Link } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
const Login = () => {
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

const [showPassword, setShowPassword] = useState(false);
const location = useLocation();
const isHome = location.pathname === "/";

  return (
	<div style={{ paddingTop: isHome ? '0px' : '100px' }}>
			<div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('public/images/banner/bnr1.jpg')"}}>
				<div className="container">
					<div className="dz-bnr-inr-entry">
						<h1>Welcome Back</h1>
						<nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
							<ul className="breadcrumb">
								<li className="breadcrumb-item"><Link to="/">Home</Link></li>
								<li className="breadcrumb-item active" aria-current="page">Login</li>
							</ul>
						</nav>
					</div>
				</div>
			</div>
		
			
			<section className="content-inner shop-account">
			<div className="container">
				<div className="row">
				<div className="col-lg-6 col-md-6 mb-4">
					<div className="login-area">
					<div className="tab-content nav">
						<form id="login" className="tab-pane active col-12">
						<h4 className="text-secondary">LOGIN</h4>
						<p className="font-weight-600">If you have an account with us, please log in.</p>
						<div className="mb-4">
							<label className="label-title">E-MAIL *</label>
							<input name="dzName" required className="form-control" placeholder="Your Email Id" type="email" />
						</div>
						<div style={{ marginBottom: "20px" }}>
							<label className="label-title">PASSWORD *</label>
							<div style={{ position: "relative", display: "flex", alignItems: "center" }}>
								<input
								name="dzName"
								required
								className="form-control"
								placeholder="Type Password"
								type={showPassword ? "text" : "password"}
								style={{ paddingRight: "40px" }}
								/>
								<span
								onClick={() => setShowPassword(!showPassword)}
								style={{
									position: "absolute",
									right: "12px",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									height: "100%",
									color: "#999",
								}}
								>
								<i className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
								</span>
							</div>
							</div>

							<div className="text-left">
							<button className="btn btn-primary btnhover me-2">login</button>
							<a data-bs-toggle="tab" href="shop-login.html#forgot-password" className="m-l5">
								<i className="fas fa-unlock-alt"></i> Forgot Password
							</a>
							</div>

						</form>
						<form id="forgot-password" className="tab-pane fade col-12">
						<h4 className="text-secondary">FORGET PASSWORD ?</h4>
						<p className="font-weight-600">We will send you an email to reset your password. </p>
						<div className="mb-3">
							<label className="label-title">E-MAIL *</label>
							<input name="dzName" required className="form-control" placeholder="Your Email Id" type="email" />
						</div>
						<div className="text-left">
							<a className="btn btn-outline-secondary btnhover m-r10" data-bs-toggle="tab" href="shop-login.html#login">Back</a>
							<button className="btn btn-primary btnhover">Submit</button>
						</div>
						</form>
					</div>
					</div>
				</div>

				<div className="col-lg-6 col-md-6 mb-4">
					<div className="login-area">
					<div className="tab-content">
						<h4>Don't have an account yet?</h4>
						<p>By creating an account with our store, you will be able to move through the checkout process faster, store multiple shipping addresses, view and track your orders in your account and more.</p>
						<Link to="/registration" className="btn btn-primary btnhover m-r5 button-lg radius-no">CREATE AN ACCOUNT</Link>
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

export default Login;