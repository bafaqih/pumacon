import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect } from "react";

const Footer = () => {
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

  return (
        <footer className="site-footer style-1">
		<div className="footer-top">
			<div className="container">
				<div className="footer-subscribe-wrapper text-lg-start text-center">
					<div className="row align-items-center">
						<div className="col-lg-6 col-md-12 col-sm-12">
							<div className="widget wow fadeInUp" data-wow-delay="0.2s">	
								<div className="footer-logo">
									<Link to="/" className="logo-dark"><img src="public/images/logo.png" alt="" /></Link>
								</div>
								<p>PumaCon, CV. Putra Manunggal Jl. Raya Kebonagung No.157, Sono Tengah, Kebonagung, Kec. Pakisaji, Kabupaten Malang, Jawa Timur 65162</p>
							</div>	
						</div>
						<div className="col-lg-6 col-md-12 col-sm-12">
							<div className="widget wow fadeInUp" data-wow-delay="0.4s">
								<h4 className="footer-title">Subscribe To Our Newsletter</h4>
								<form className="dzSubscribe ft-subscribe mb-4" action="/api/subscribe" method="post">
									<div className="dzSubscribeMsg"></div>
									<div className="input-group mb-0"> 
										<input name="dzEmail" required="required" type="email" className="form-control" placeholder="Enter Your Email"/>
										<button name="submit" value="Submit" type="submit" className="btn btn-dark style-1 ">Subscribe</button>				
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
		
				<div className="row text-lg-start text-center">
					<div className="col-lg-6 col-md-12 col-sm-12">
						<div className="widget widget_links wow fadeInUp" data-wow-delay="0.6s">
							<h4 className="footer-title">OUR LINKS</h4>
							<ul>
								<li><Link to="/" onClick={(e) => handleNavClick(e, '/')}>Home</Link></li>
                                <li><Link to="/about" onClick={(e) => handleNavClick(e, '/about')}>About Us</Link></li>
                                <li><Link to="/products" onClick={(e) => handleNavClick(e, '/products')}>Products</Link></li>
                                <li><Link to="/news" onClick={(e) => handleNavClick(e, '/news')}>News</Link></li>
                                <li><Link to="/contact" onClick={(e) => handleNavClick(e, '/contact')}>Contact Us</Link></li>
							</ul>
						</div>
					</div>
					<div className="col-lg-6 col-md-12 col-sm-12">
						<div className="widget widget_links wow fadeInUp text-lg-end " data-wow-delay="0.8s">
							<h4 className="footer-title">OUR SOCIALS</h4>
							<ul className="justify-content-lg-end">
								<li><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                                <li><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                                <li><a href="https://www.linkedin.com/in/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                                <li><a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">X</a></li>
   
							</ul>
						</div>
					</div>
				</div>	
			</div>
		</div>
		<div className="footer-bottom">
			<div className="container">
				<div className="footer-inner">
					<div className="row align-items-center">
						<div className="col-lg-6 col-md-6 col-sm-12 text-lg-start text-md-start text-center">
							<p className="copyright-text wow fadeInUp" data-wow-delay="1.0s">Copyright © {new Date().getFullYear()} PumaCon. All right reserved.</p>
						</div>
					</div>
				</div>	
			</div>
		</div>	
	</footer>
  );
};

export default Footer;
