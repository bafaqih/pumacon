import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState} from "react";

const Homepage = () => {
  const navigate = useNavigate();
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
				onClick={() => navigate('/products')}
				className="btn btn-white btn-lg mt-4 wow fadeInUp"
				data-wow-delay="1.4s"
				>Shop More</button>
            </div>
          </div>
        </div>
      </div>		
				
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