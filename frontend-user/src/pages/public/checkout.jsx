import { Link } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { FaAngleDown } from 'react-icons/fa';
const Checkout = () => {
  useEffect(() => {
    if (window.WOW) {
      new window.WOW().init();
    }
  }, []);

const [addresses] = useState([
  "Jl. Nusa Indah Baru No. 4 RT05/RW06 Kel. Sukabumi, Kec. Mayangan, Kota Probolinggo 67219",
  "Jl. Abdillah No. 28 RT05/RW06 Kel. Tirtomoyo, Kec. Pakis, Kabupaten Malang 67219",
]);
const [address, setAddress] = useState(addresses[0]);
const [dropdownOpen, setDropdownOpen] = useState(false);
const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

const location = useLocation();
const isHome = location.pathname === "/";

const [paymentMethod, setPaymentMethod] = useState("");

const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  return (
	

	<div style={{ paddingTop: isHome ? '0px' : '100px' }}>
			<div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('public/images/banner/bnr1.jpg')"}}>
				<div className="container">
					<div className="dz-bnr-inr-entry">
						<h1>Checkout Payment</h1>
						<nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
							<ul className="breadcrumb">
								<li className="breadcrumb-item"><Link to="/">Home</Link></li>
								<li className="breadcrumb-item active" aria-current="page">Checkout</li>
							</ul>
						</nav>
					</div>
				</div>
			</div>
		
			<section className="content-inner-1">
				<div className="container">
					<div className="row">
						<div className="col-lg-12">
							<div className="widget">
								<h4 className="widget-title">Your Order</h4>
								<table className="table-bordered check-tbl">
								<thead className="text-center">
									<tr>
									<th>IMAGE</th>
									<th>PRODUCT NAME</th>
									<th>QUANTITY</th>
									<th>TOTAL</th>
									</tr>
								</thead>
								<tbody>
									<tr>
									<td className="product-item-img">
										<img src="public/images/product/pic1.png" alt="" />
									</td>
									<td className="product-item-name">Product Item 5</td>
									<td className="product-qty text-center">1</td>
									<td className="product-price text-center">$30.00</td>
									</tr>
									<tr>
									<td className="product-item-img">
										<img src="public/images/product/pic2.png" alt="" />
									</td>
									<td className="product-item-name">Product Item 4</td>
									<td className="product-qty text-center">2</td>
									<td className="product-price text-center">$36.00</td>
									</tr>
									<tr>
									<td className="product-item-img">
										<img src="public/images/product/pic3.png" alt="" />
									</td>
									<td className="product-item-name">Product Item 3</td>
									<td className="product-qty text-center">1</td>
									<td className="product-price text-center">$25.00</td>
									</tr>
									<tr>
									<td className="product-item-img">
										<img src="public/images/product/pic4.png" alt="" />
									</td>
									<td className="product-item-name">Product Item 2</td>
									<td className="product-qty text-center">3</td>
									<td className="product-price text-center">$22.00</td>
									</tr>
									<tr>
									<td className="product-item-img">
										<img src="public/images/product/pic5.png" alt="" />
									</td>
									<td className="product-item-name">Product Item 1</td>
									<td className="product-qty text-center">1</td>
									<td className="product-price text-center">$28.00</td>
									</tr>
								</tbody>
								</table>
								    <div className="form-group mt-4">
										<textarea
											className="form-control"
											rows="5"
											placeholder="Notes about your order"
										></textarea>
									</div>
							</div>
						</div>
						<div className="col-lg-6">
						<form className="shop-form widget">
							<h4 className="widget-title">Your Address</h4>
							<div className="position-relative">
							<table className="table-bordered check-tbl mb-0 w-100">
								<tbody>
								<tr>
									<td style={{ whiteSpace: 'pre-wrap' }}>{address}</td>
									<td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
									<button
										type="button"
										className="btn btn-light"
										onClick={toggleDropdown}
									>
										<FaAngleDown />
									</button>
									</td>
								</tr>
								</tbody>
							</table>

							{dropdownOpen && (
								<div
								className="border p-3 bg-white shadow rounded mt-1 position-absolute w-100"
								style={{ zIndex: 10 }}
								>
								{addresses.map((addr, idx) => (
									<div
									key={idx}
									className={`mb-2 p-2 rounded ${
										addr === address ? 'bg-light fw-bold' : 'bg-white'
									}`}
									style={{ cursor: 'pointer', whiteSpace: 'pre-wrap' }}
									onClick={() => {
										setAddress(addr);
										setDropdownOpen(false);
									}}
									>
									{addr}
									</div>
								))}
								</div>
							)}
							</div>
						</form>
						</div>

						{/* Order Total & Payment Method */}
						<div className="col-lg-6">
							<form className="shop-form widget">
							<h4 className="widget-title">Order Total</h4>
							<table className="table-bordered check-tbl mb-4">
								<tbody>
								<tr>
									<td>Order Subtotal</td>
									<td className="product-price">$125.96</td>
								</tr>
								<tr>
									<td>Shipping</td>
									<td>Free Shipping</td>
								</tr>
								<tr>
									<td>Total</td>
									<td className="product-price-total">$506.00</td>
								</tr>
								</tbody>
							</table>

							<h4 className="widget-title">Payment Method</h4>
							<div className="form-group">
								<select
								className="default-select"
								value={paymentMethod}
								onChange={handlePaymentChange}
								>
								<option value="" disabled>
									Choose Payment Method
								</option>
								<option value="bank-transfer">Bank Transfer</option>
								</select>
							</div>

							{paymentMethod === "bank-transfer" && (
								<>
								<table className="table-bordered check-tbl m-b25">
									<tbody>
									<tr>
										<td>Bank</td>
										<td>Bank BCA</td>
									</tr>
									<tr>
										<td>Account Number</td>
										<td>0391886481</td>
									</tr>
									<tr>
										<td>Name of Account</td>
										<td>PT Pumacon Putra Manunggal</td>
									</tr>
									</tbody>
								</table>

								<div className="form-group">
									<label style={{ marginBottom: "10px", color: "#090915" }}>
									Upload Proof of Payment
									</label>
									<input type="file" className="form-control" />
								</div>

								<div className="form-group">
									<button className="btn btn-gray btnhover" type="button">
									Place Order Now
									</button>
								</div>
								</>
							)}
							</form>
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

export default Checkout;