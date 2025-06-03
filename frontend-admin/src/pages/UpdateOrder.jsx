import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const UpdateOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [notes, setNotes] = useState(''); // Notes akan tetap di-fetch tapi dibuat read-only

  // Mock data untuk detail pesanan tunggal.
  const mockOrderData = {
    id: 'FC001',
    currentStatus: 'Processed', // Diubah untuk contoh
    customer: {
      name: 'John Alex',
      email: 'anderalex@example.com',
      phone: '+998 99 22123456',
      // profileUrl: '#!', // Dihapus karena link View Profile dihapus
    },
    shippingAddress: {
      name: 'Gerg Harvell',
      addressLine1: '568, Suite Ave.',
      cityStateZip: 'Austrlia, 235153',
      // phone: '+91 99999 12345', // Dihapus
    },
    orderDate: 'October 22, 2023',
    paymentMethod: 'Bank Transfer', // Diubah
    items: [
      { id: 'item1', imgSrc: '/assets/images/products/product-img-1.jpg', name: "Haldiram's Sev Bhujia", price: '$18.00', quantity: 1, total: '$18.00' },
      { id: 'item2', imgSrc: '/assets/images/products/product-img-2.jpg', name: 'NutriChoice Digestive', price: '$24.00', quantity: 1, total: '$24.00' },
      { id: 'item3', imgSrc: '/assets/images/products/product-img-3.jpg', name: 'Cadbury 5 Star Chocolate', price: '$32.00', quantity: 1, total: '$32.00' },
      { id: 'item4', imgSrc: '/assets/images/products/product-img-4.jpg', name: 'Onion Flavour Potato', price: '$3.00', quantity: 2, total: '$6.00' },
    ],
    subTotal: '$80.00',
    shippingCost: 'Free', // Diubah
    grandTotal: '$80.00', // Disesuaikan karena shipping free
    initialNotes: 'This is a sample note for the order. It should not be editable from this page.',
  };
  
  // Menambahkan data untuk orderId lain agar bisa diuji
   const mockOrdersDatabase = {
    'FC001': mockOrderData, // Menggunakan data di atas untuk FC001
    '1007': {
      id: '1007',
      currentStatus: 'Shipped',
      customer: { name: 'Jennifer Sullivan', email: 'jennifer@example.com', phone: '+1 234 567 8900' },
      shippingAddress: { name: 'Jennifer Sullivan', addressLine1: '123 Main St', cityStateZip: 'New York, NY 10001' },
      orderDate: '01 May 2023 (10:12 am)',
      paymentMethod: 'Bank Transfer',
      items: [
         { id: 'p1', name: "Haldiram's Sev Bhujia", imgSrc: '/assets/images/products/product-img-1.jpg', price: '$12.99', quantity: 1, total: '$12.99' },
      ],
      subTotal: '$12.99',
      shippingCost: 'Free',
      grandTotal: '$12.99',
      initialNotes: 'Fragile items, handle with care.',
    }
    // Anda bisa menambahkan lebih banyak order ID di sini
  };


  useEffect(() => {
    console.log('Fetching order details for ID:', orderId);
    const fetchedOrder = mockOrdersDatabase[orderId] || mockOrdersDatabase['FC001']; // Fallback ke FC001 jika ID tidak ditemukan
    
    setOrderDetails(fetchedOrder);
    setOrderStatus(fetchedOrder.currentStatus);
    setNotes(fetchedOrder.initialNotes || '');
    
  }, [orderId]);

  const handleStatusChange = (e) => {
    setOrderStatus(e.target.value);
  };

  // handleNotesChange tidak lagi diperlukan jika notes read-only
  // const handleNotesChange = (e) => {
  //   setNotes(e.target.value);
  // };

  const handleSaveChanges = () => {
    // Hanya status yang bisa diubah dari halaman ini
    console.log('Saving changes for order:', orderId, { status: orderStatus });
    alert(`Order ${orderId} status updated to ${orderStatus}. Notes are read-only.`);
    // navigate('/dashboard/orders'); 
  };

  if (!orderDetails) {
    return (
      <main className="main-content-wrapper">
        <div className="container">
          <p>Loading order details for #{orderId} or order not found...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
              <div>
                <h2>Order Detail / Update Status</h2> {/* Judul disesuaikan */}
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/orders" className="text-inherit">Order List</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Order #{orderDetails.id}</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/orders" className="btn btn-light">Back to all orders</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12 col-12 mb-5">
            <div className="card h-100 card-lg">
              <div className="card-body p-6">
                <div className="d-md-flex justify-content-between">
                  <div className="d-flex align-items-center mb-2 mb-md-0">
                    <h2 className="mb-0">Order ID: #{orderDetails.id}</h2>
                    {/* Status badge disesuaikan dengan status baru */}
                    <span className={`badge ms-2 
                      ${orderStatus.toLowerCase() === 'success' ? 'bg-light-success text-dark-success' : 
                        orderStatus.toLowerCase() === 'processed' ? 'bg-light-info text-dark-info' :
                        orderStatus.toLowerCase() === 'shipped' ? 'bg-light-primary text-dark-primary' :
                        orderStatus.toLowerCase() === 'cancel' ? 'bg-light-danger text-dark-danger' :
                        'bg-light-warning text-dark-warning'}`}>
                      {orderStatus}
                    </span>
                  </div>
                  <div className="d-md-flex">
                    <div className="mb-2 mb-md-0">
                      {/* Opsi status di dropdown diubah */}
                      <select className="form-select" value={orderStatus} onChange={handleStatusChange}>
                        <option value="Processed">Processed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Success">Success</option>
                        <option value="Cancel">Cancel</option>
                        {/* Hapus Pending & Delivered jika tidak diperlukan */}
                      </select>
                    </div>
                    <div className="ms-md-3">
                      <button type="button" className="btn btn-primary" onClick={handleSaveChanges}>Save Changes</button>
                      {/* Tombol Download Invoice dihapus */}
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="row">
                    <div className="col-lg-4 col-md-4 col-12">
                      <div className="mb-6">
                        <h6>Customer Details</h6>
                        <p className="mb-1 lh-lg">
                          {orderDetails.customer.name}<br />
                          {orderDetails.customer.email}<br />
                          {orderDetails.customer.phone}
                        </p>
                        {/* Link View Profile dihapus */}
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-12">
                      <div className="mb-6">
                        <h6>Shipping Address</h6>
                        <p className="mb-1 lh-lg">
                          {orderDetails.shippingAddress.name}<br />
                          {orderDetails.shippingAddress.addressLine1}<br />
                          {orderDetails.shippingAddress.cityStateZip}
                          {/* Nomor telepon dari shipping address dihapus */}
                        </p>
                      </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-12">
                      <div className="mb-6">
                        <h6>Order Details</h6>
                        <p className="mb-1 lh-lg">
                          Order ID: <span className="text-dark">{orderDetails.id}</span><br />
                          Order Date: <span className="text-dark">{orderDetails.orderDate}</span><br />
                          Order Total: <span className="text-dark">{orderDetails.grandTotal}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="table-responsive mt-6">
                    <table className="table mb-0 text-nowrap table-centered">
                      <thead className="bg-light">
                        <tr>
                          <th>Products</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <Link to={`/dashboard/products/${item.id}/detail`} className="text-inherit">
                                <div className="d-flex align-items-center">
                                  <div>
                                    <img src={item.imgSrc} alt={item.name} className="icon-shape icon-lg" />
                                  </div>
                                  <div className="ms-lg-4 mt-2 mt-lg-0">
                                    <h5 className="mb-0 h6">{item.name}</h5>
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td><span className="text-body">{item.price}</span></td>
                            <td>{item.quantity}</td>
                            <td className="text-end">{item.total}</td>
                          </tr>
                        ))}
                        <tr>
                          <td className="border-bottom-0 pb-0"></td>
                          <td className="border-bottom-0 pb-0"></td>
                          <td colSpan="1" className="fw-medium text-dark text-end">
                            Sub Total :
                          </td>
                          <td className="fw-medium text-dark text-end">
                            {orderDetails.subTotal}
                          </td>
                        </tr>
                        <tr>
                          <td className="border-bottom-0 pb-0"></td>
                          <td className="border-bottom-0 pb-0"></td>
                          <td colSpan="1" className="fw-medium text-dark text-end">
                            Shipping Cost:
                          </td>
                          <td className="fw-medium text-dark text-end">
                            {orderDetails.shippingCost}
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td colSpan="1" className="fw-semibold text-dark text-end">
                            Grand Total:
                          </td>
                          <td className="fw-semibold text-dark text-end">
                            {orderDetails.grandTotal}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="card-body p-6 mt-2">
                <div className="row">
                  <div className="col-md-6 mb-4 mb-lg-0">
                    <h6>Payment Info</h6>
                    <span>Bank Transfer</span> {/* Diubah menjadi Bank Transfer */}
                  </div>
                  <div className="col-md-6">
                    <h5>Notes</h5>
                    <textarea 
                      className="form-control mb-3" 
                      rows="3" 
                      placeholder="Order notes..."
                      value={notes}
                      readOnly // Dibuat tidak bisa diedit
                    ></textarea>
                    {/* Tombol Save Notes dihapus */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UpdateOrder;