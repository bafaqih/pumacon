import { Link } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
const Cart = () => {
	const isHome = location.pathname === "/";
	const initialProducts = [
		{ name: "Product Item 1", price: 35.0, img: "public/images/product/pic1.png" },
		{ name: "Product Item 2", price: 30.0, img: "public/images/product/pic2.png" },
		{ name: "Product Item 3", price: 28.0, img: "public/images/product/pic3.png" },
		{ name: "Product Item 4", price: 25.0, img: "public/images/product/pic4.png" },
	];

	const [products, setProducts] = useState(initialProducts);
	const [quantities, setQuantities] = useState(initialProducts.map(() => 1));
	const [selected, setSelected] = useState(initialProducts.map(() => true));

	const increment = (index) => {
		const newQuantities = [...quantities];
		newQuantities[index]++;
		setQuantities(newQuantities);
	};

	const decrement = (index) => {
		const newQuantities = [...quantities];
		newQuantities[index]--;
		if (newQuantities[index] <= 0) {
		handleRemoveItem(index);
		} else {
		setQuantities(newQuantities);
		}
	};

	const handleQuantityChange = (index, value) => {
		const val = parseInt(value, 10);
		if (isNaN(val) || val < 0) return;
		if (val === 0) {
		handleRemoveItem(index);
		} else {
		const newQuantities = [...quantities];
		newQuantities[index] = val;
		setQuantities(newQuantities);
		}
	};

	const handleRemoveItem = (index) => {
		const newProducts = [...products];
		const newQuantities = [...quantities];
		const newSelected = [...selected];
		newProducts.splice(index, 1);
		newQuantities.splice(index, 1);
		newSelected.splice(index, 1);
		setProducts(newProducts);
		setQuantities(newQuantities);
		setSelected(newSelected);
	};

	const toggleSelect = (index) => {
		const newSelected = [...selected];
		newSelected[index] = !newSelected[index];
		setSelected(newSelected);
	};

	const subtotal = products.reduce((acc, product, i) => selected[i] ? acc + product.price * quantities[i] : acc, 0).toFixed(2);
	const total = subtotal;

  return (
		<div style={{ paddingTop: isHome ? '0px' : '100px' }}>
		<div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('public/images/banner/bnr1.jpg')" }}>
			<div className="container">
			<div className="dz-bnr-inr-entry">
				<h1>My Cart</h1>
				<nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
				<ul className="breadcrumb">
					<li className="breadcrumb-item"><Link to="/">Home</Link></li>
					<li className="breadcrumb-item active" aria-current="page">Cart</li>
				</ul>
				</nav>
			</div>
			</div>
		</div>

		<div className="content-inner-1">
		<div className="container">
			<div className="row">
			<div className="col-lg-12 m-b30">
				<div className="table-responsive">
				<table className="table check-tbl table-responsive-md">
					<thead>
					<tr>
						<th>Product</th>
						<th>Product name</th>
						<th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Unit Price</th>
						<th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Quantity</th>
						<th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Total</th>
						<th style={{ textAlign: 'center', verticalAlign: 'middle' }}>Select</th>
					</tr>
					</thead>
					<tbody>
					{products.map((product, index) => (
						<tr key={index}>
						<td className="product-item-img"><img src={product.img} alt="" /></td>
						<td className="product-item-name">{product.name}</td>
						<td className="product-item-price" style={{ textAlign: 'center', verticalAlign: 'middle' }}> ${product.price.toFixed(2)}</td>
						<td className="product-item-quantity text-center align-middle">
						<div className="quantity btn-quantity style-1 d-inline-flex align-items-center justify-content-center">
							<button onClick={() => decrement(index)} className="btn btn-sm btn-light">-</button>
							<input
							type="text"
							value={quantities[index]}
							onChange={(e) => handleQuantityChange(index, e.target.value)}
							className="form-control text-center mx-2"
							style={{ width: '50px' }}
							/>
							<button onClick={() => increment(index)} className="btn btn-sm btn-light">+</button>
						</div>
						</td>
						<td className="product-item-totle" style={{ textAlign: 'center', verticalAlign: 'middle' }}>${(product.price * quantities[index]).toFixed(2)}</td>
						<td
						className="product-item-close"
						style={{ textAlign: 'center', verticalAlign: 'middle' }}
						>
						<input
							type="checkbox"
							checked={selected[index]}
							onChange={() => toggleSelect(index)}
						/>
						</td>
						</tr>
					))}
					</tbody>
				</table>
				</div>
			</div>
			</div>

			<div className="row m-t20">
			<div className="col-lg-6 m-b30">
				<div className="widget">
				<h4 className="widget-title">Cart Subtotal</h4>
				<table className="table-bordered check-tbl m-b25">
					<tbody>
					<tr>
						<td>Order Subtotal</td>
						<td>${subtotal}</td>
					</tr>
					</tbody>
				</table>
				<div className="form-group m-b25">
					<a href="/checkout" className="btn btn-gray btnhover">Proceed to Checkout</a>
				</div>
				</div>
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

export default Cart;