import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const About = () => {
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

const location = useLocation();
const isHome = location.pathname === "/";
const { t } = useTranslation();

  return (
    <div style={{ paddingTop: isHome ? '0px' : '100px' }}>
		<div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: 'url("public/images/banner/bnr1.jpg")' }}>
			<div className="container">
				<div className="dz-bnr-inr-entry">
					<h1>{t("about_title")}</h1>
					<nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
						<ul className="breadcrumb">
							<li className="breadcrumb-item"><Link to="/">{t("home")}</Link></li>
							<li className="breadcrumb-item active" aria-current="page">{t("about_title")}</li>
						</ul>
					</nav>
				</div>
			</div>
		</div>
		
		<section className="content-inner overflow-hidden position-relative">
			<div className="container">
				<div className="section-head text-center wow fadeInUp" data-wow-delay="0.6s">
				<div className="logo-wrapper">
					<img src="/images/logo.png" alt="PumaCon Logo" className="pumacon-logo" />
				</div>
					
				</div>
					<div className="section-box wow fadeInUp" data-wow-delay="0.8s">
					<h6 className="text wow fadeInUp" data-wow-delay="0.8s">{t("about_title")}</h6>
					<h6 className="subtext wow fadeInUp" data-wow-delay="0.8s">{t("about_description")}</h6>
					</div>

					<div className="section-box wow fadeInUp" data-wow-delay="0.8s">
					<h6 className="text wow fadeInUp" data-wow-delay="0.8s">{t("services_title")}</h6>
					<h6 className="subtext wow fadeInUp" data-wow-delay="0.8s">{t("services_description")}</h6>
					</div>

					<div className="section-box wow fadeInUp" data-wow-delay="0.8s">
					<h6 className="text wow fadeInUp" data-wow-delay="0.8s">{t("vision_title")}</h6>
					<h6 className="subtext wow fadeInUp" data-wow-delay="0.8s">{t("vision_description")}</h6>
					</div>

					<div className="section-box wow fadeInUp" data-wow-delay="0.8s">
					<h6 className="text wow fadeInUp" data-wow-delay="0.8s">{t("mission_title")}</h6>
					<h6 className="subtext wow fadeInUp" data-wow-delay="0.8s">{t("mission_1")}</h6>
					<h6 className="subtext wow fadeInUp" data-wow-delay="0.8s">{t("mission_2")}</h6>
					<h6 className="subtext wow fadeInUp" data-wow-delay="0.8s">{t("mission_3")}</h6>
					<h6 className="subtext wow fadeInUp" data-wow-delay="0.8s">{t("mission_4")}</h6>
					<h6 className="subtext wow fadeInUp" data-wow-delay="0.8s">{t("mission_5")}</h6>
					<h6 className="subtext wow fadeInUp" data-wow-delay="0.8s">{t("mission_6")}</h6>
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


export default About;