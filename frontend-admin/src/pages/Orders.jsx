import React from 'react';
import { Link } from 'react-router-dom';

const Orders = () => {
  // Data pesanan ini bisa berasal dari API call nantinya.
  // Status dan statusClass disesuaikan dengan permintaan baru.
  const ordersData = [
    {
      id: '1007',
      imgSrc: '/assets/images/products/product-img-1.jpg',
      orderName: 'FC#1007',
      customer: 'Jennifer Sullivan',
      dateTime: '01 May 2023 (10:12 am)',
      paymentMethod: 'Bank Transfer',
      status: 'Success', // Tetap Success
      statusClass: 'bg-light-success text-dark-success', // Class untuk Success
      amount: '$12.99',
    },
    {
      id: '1006',
      imgSrc: '/assets/images/products/product-img-2.jpg',
      orderName: 'FC#1006',
      customer: 'Willie Hanson',
      dateTime: '20 April 2023 (9:20 am)',
      paymentMethod: 'Bank Transfer',
      status: 'Success', // Tetap Success
      statusClass: 'bg-light-success text-dark-success', // Class untuk Success
      amount: '$8.19',
    },
    {
      id: '1005',
      imgSrc: '/assets/images/products/product-img-3.jpg',
      orderName: 'FC#1005',
      customer: 'Dori Stewart',
      dateTime: '11 March 2023 (7:12 pm)',
      paymentMethod: 'Bank Transfer',
      status: 'Processed', // Diubah dari Pending
      statusClass: 'bg-light-info text-dark-info', // Contoh class untuk Processed (biru muda)
      amount: '$8.19',
    },
    {
      id: '1004',
      imgSrc: '/assets/images/products/product-img-4.jpg',
      orderName: 'FC#1004',
      customer: 'Ezekiel Rogerson',
      dateTime: '09 March 2023 (6:23 pm)',
      paymentMethod: 'Bank Transfer',
      status: 'Shipped', // Diubah dari Success
      statusClass: 'bg-light-primary text-dark-primary', // Contoh class untuk Shipped (biru tua/primary)
      amount: '$23.11',
    },
    {
      id: '1003',
      imgSrc: '/assets/images/products/product-img-5.jpg',
      orderName: 'FC#1003',
      customer: 'Maria Roux',
      dateTime: '18 Feb 2023', // Disesuaikan
      paymentMethod: 'Bank Transfer',
      status: 'Success',
      statusClass: 'bg-light-success text-dark-success',
      amount: '$2.00',
    },
    {
      id: '1002',
      imgSrc: '/assets/images/products/product-img-6.jpg',
      orderName: 'FC#1002',
      customer: 'Robert Donald',
      dateTime: '12 Feb 2023', // Disesuaikan
      paymentMethod: 'Bank Transfer',
      status: 'Cancel', // Tetap Cancel
      statusClass: 'bg-light-danger text-dark-danger', // Class untuk Cancel
      amount: '$56.00',
    },
    {
      id: '1001',
      imgSrc: '/assets/images/products/product-img-7.jpg',
      orderName: 'FC#1001',
      customer: 'Diann Watson',
      dateTime: '22 Jan 2023 (1:20 pm)',
      paymentMethod: 'Bank Transfer',
      status: 'Success',
      statusClass: 'bg-light-success text-dark-success',
      amount: '$23.00',
    },
  ];

  // Fungsi untuk menentukan kelas badge berdasarkan status
  // Anda mungkin sudah memiliki ini di CSS atau bisa didefinisikan di sini
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-light-success text-dark-success';
      case 'processed':
        return 'bg-light-info text-dark-info'; // Contoh: Biru muda untuk 'Processed'
      case 'shipped':
        return 'bg-light-primary text-dark-primary'; // Contoh: Biru untuk 'Shipped'
      case 'cancel':
        return 'bg-light-danger text-dark-danger';
      case 'pending': // Jika masih ada status pending di data lain
        return 'bg-light-warning text-dark-warning';
      default:
        return 'bg-light-secondary text-dark-secondary';
    }
  };


  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div>
              <h2>Order List</h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Order List</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12 col-12 mb-5">
            <div className="card h-100 card-lg">
              <div className="p-6">
                <div className="row justify-content-between">
                  <div className="col-md-4 col-12 mb-2 mb-md-0">
                    <form className="d-flex" role="search">
                      <input className="form-control" type="search" placeholder="Search Orders" aria-label="Search" />
                    </form>
                  </div>
                  <div className="col-lg-2 col-md-4 col-12">
                    {/* PERUBAHAN PADA OPSI STATUS FILTER */}
                    <select className="form-select">
                      <option value="">All Status</option> {/* Pilihan default */}
                      <option value="Processed">Processed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Success">Success</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-centered table-hover text-nowrap table-borderless mb-0 table-with-checkbox">
                    <thead className="bg-light">
                      <tr>
                        <th>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="checkAll" />
                            <label className="form-check-label" htmlFor="checkAll"></label>
                          </div>
                        </th>
                        <th>Image</th>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date & Time</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersData.map((order, index) => (
                        <tr key={order.id}>
                          <td>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" value="" id={`order-${order.id}-${index}`} />
                              <label className="form-check-label" htmlFor={`order-${order.id}-${index}`}></label>
                            </div>
                          </td>
                          <td>
                            <Link to={`/dashboard/orders/${order.id}`}><img src={order.imgSrc} alt={`Order ${order.orderName}`} className="icon-shape icon-md" /></Link>
                          </td>
                          <td><Link to={`/dashboard/orders/${order.id}`} className="text-reset">{order.orderName}</Link></td>
                          <td>{order.customer}</td>
                          <td>{order.dateTime}</td>
                          <td>{order.paymentMethod}</td>
                          <td>
                            {/* Menggunakan fungsi getStatusClass untuk konsistensi badge */}
                            <span className={`badge ${getStatusClass(order.status)}`}>{order.status}</span>
                          </td>
                          <td>{order.amount}</td>
                          <td>
                            <div className="dropdown">
                              <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="feather-icon icon-more-vertical fs-5"></i>
                              </Link>
                              <ul className="dropdown-menu">
                                <li>
                                  <Link className="dropdown-item" to="#">
                                    <i className="bi bi-trash me-3"></i>Delete
                                  </Link>
                                </li>
                                <li>
                                  <Link className="dropdown-item" to={`/dashboard/orders/${order.id}`}>
                                    <i className="bi bi-pencil-square me-3"></i>Update {/* Teks diubah dari View menjadi Update */}
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border-top d-md-flex justify-content-between align-items-center p-6">
                <span>Showing 1 to {ordersData.length} of {ordersData.length} entries</span>
                <nav className="mt-2 mt-md-0">
                  <ul className="pagination mb-0">
                    <li className="page-item disabled"><Link className="page-link" to="#!">Previous</Link></li>
                    <li className="page-item"><Link className="page-link active" to="#!">1</Link></li>
                    <li className="page-item"><Link className="page-link" to="#!">Next</Link></li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Orders;