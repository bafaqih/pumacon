import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // useParams dan useNavigate tidak lagi dibutuhkan di sini jika halaman ini hanya daftar

const Customers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customersData = [
    {
      id: 'CU001',
      name: 'Bonnie Howe',
      email: 'bonniehowe@gmail.com',
      purchaseDate: '17 May, 2023 at 3:18pm',
      phone: '123-456-7890',
      spent: '$49.00',
      avatar: '/assets/images/avatar/avatar-1.jpg',
      verified: true,
      lastActive: '31 May, 2025 3:24PM',
      joinDate: '31 May, 2024',
      totalSpentOffcanvas: '$105',
      totalOrdersOffcanvas: 3,
      addresses: [
        { id: 'addr1', text: '123 Apple St., Springfield, IL, 62701, USA', default: true },
        { id: 'addr2', text: '456 Banana St., Metropolis, NY, 10001, USA', default: false },
      ],
      orders: [
        { id: 'order1', orderDisplayId: '#001', name: 'Organic Banana', imgSrc: '/assets/images/products/product-img-18.jpg', amount: '$35.00', date: '31 May, 2025', orderIdLink: 'FC001-Detail' },
        { id: 'order2', orderDisplayId: '#001', name: 'Fresh Apple', imgSrc: '/assets/images/products/product-img-15.jpg', amount: '$70.00', date: '31 May, 2025', orderIdLink: 'FC001-Detail' },
        { id: 'order3', orderDisplayId: '#001', name: 'BeetRoot', imgSrc: '/assets/images/products/product-img-19.jpg', amount: '$29.00', date: '31 May, 2025', orderIdLink: 'FC001-Detail' },
      ],
      totalOrderAmount: '$134.00'
    },
    {
      id: 'CU002',
      name: 'Judy Nelson',
      email: 'judynelson@gmail.com',
      purchaseDate: '27 April, 2023 at 2:47pm',
      phone: '435-239-6436',
      spent: '$490.00',
      avatar: '/assets/images/avatar/avatar-2.jpg',
      verified: false,
      lastActive: '28 May, 2025 10:00AM',
      joinDate: '15 April, 2023',
      totalSpentOffcanvas: '$490.00',
      totalOrdersOffcanvas: 1,
      addresses: [
        { id: 'addr3', text: '789 Orange Ave, Gotham, NJ, 07001, USA', default: true },
      ],
      orders: [
         { id: 'order4', orderDisplayId: '#002', name: 'NutriChoice Digestive', imgSrc: '/assets/images/products/product-img-2.jpg', amount: '$490.00', date: '27 April, 2023', orderIdLink: 'FC002-Detail' },
      ],
      totalOrderAmount: '$490.00'
    },
    // Tambahkan customer lain sesuai kebutuhan
  ];

  const handleViewCustomerInOffcanvas = (customerId) => {
    const customer = customersData.find(c => c.id === customerId);
    setSelectedCustomer(customer);
  };

  return (
    <>
      <main className="main-content-wrapper">
        <div className="container">
          <div className="row mb-8">
            <div className="col-md-12">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                <div>
                  <h2>Customers</h2>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0">
                      <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                      <li className="breadcrumb-item active" aria-current="page">Customers</li>
                    </ol>
                  </nav>
                </div>
                {/* Tombol Add New Customer sudah dihapus */}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12 col-12 mb-5">
              <div className="card h-100 card-lg">
                <div className="p-6">
                  <div className="row justify-content-between">
                    <div className="col-md-4 col-12">
                      <form className="d-flex" role="search">
                        <label htmlFor="searchCustomers" className="visually-hidden">Search Customers</label>
                        <input className="form-control" type="search" id="searchCustomers" placeholder="Search Customers" aria-label="Search" />
                      </form>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-centered table-hover table-borderless mb-0 table-with-checkbox text-nowrap">
                      <thead className="bg-light">
                        <tr>
                          <th>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" value="" id="checkAll" />
                              <label className="form-check-label" htmlFor="checkAll"></label>
                            </div>
                          </th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Spent</th>
                          <th>Last Purchase</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {customersData.map((customer, index) => (
                          <tr key={customer.id}>
                            <td>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id={`customer-${customer.id}-${index}`} />
                                <label className="form-check-label" htmlFor={`customer-${customer.id}-${index}`}></label>
                              </div>
                            </td>
                            {/* PERUBAHAN DI SINI: Nama pelanggan menjadi teks biasa */}
                            <td>
                              {customer.name}
                            </td>
                            <td>{customer.email}</td>
                            <td>{customer.phone || '-'}</td>
                            <td>{customer.spent}</td>
                            <td>{customer.purchaseDate}</td>
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
                                    <a
                                      className="dropdown-item"
                                      href="#!"
                                      data-bs-toggle="offcanvas"
                                      data-bs-target="#offcanvasRight"
                                      aria-controls="offcanvasRight"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleViewCustomerInOffcanvas(customer.id);
                                      }}
                                    >
                                      <i className="bi bi-eye me-3"></i>View
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-top d-md-flex justify-content-between align-items-center p-6">
                    <span>Showing 1 to {customersData.length} of {customersData.length} entries</span>
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
        </div>
      </main>

      {/* Offcanvas untuk Detail Customer (tidak ada perubahan di sini) */}
      <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title" id="offcanvasRightLabel">Customer Details</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        {selectedCustomer ? (
          <div className="offcanvas-body d-flex flex-column gap-4">
            <div className="d-flex flex-row align-items-center gap-4 w-100">
              <div className="d-flex flex-column gap-1 flex-grow-1">
                <h3 className="mb-0 h5 d-flex flex-row gap-3">
                  {selectedCustomer.name}
                  {selectedCustomer.verified && <span className="badge bg-light-success text-dark-success">Verified</span>}
                </h3>
                <div className="d-md-flex align-items-center justify-content-between">
                  <div className="">#{selectedCustomer.id}</div>
                </div>
              </div>
            </div>
            <div className="d-flex flex-md-row flex-column gap-md-6 gap-2">
              <div className="d-flex flex-row gap-2">
                <span className="text-dark fw-semibold">Email</span>
                <span className="text-black-50">{selectedCustomer.email}</span>
              </div>
              <div className="d-flex flex-row gap-2">
                <span className="text-dark fw-semibold">Phone Number</span>
                <span className="text-black-50">{selectedCustomer.phone}</span>
              </div>
            </div>
            <div className="card rounded">
              <div className="card-body">
                <div className="row">
                  <div className="border-end col-4">
                    <div className="d-flex flex-column gap-1">
                      <span className="text-black-50">Join Date</span>
                      <span className="text-dark">{selectedCustomer.joinDate}</span>
                    </div>
                  </div>
                  <div className="border-end col-4">
                    <div className="d-flex flex-column gap-1">
                      <span className="text-black-50">Total Spent</span>
                      <span className="text-dark">{selectedCustomer.totalSpentOffcanvas}</span>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="d-flex flex-column gap-1">
                      <span className="text-black-50">Total Order</span>
                      <span className="text-dark">{selectedCustomer.totalOrdersOffcanvas}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="border-bottom p-4">
                <h3 className="mb-0 h6">Details</h3>
              </div>
              <div className="card-body p-4 d-flex flex-column gap-5">
                <div className="d-flex flex-column gap-2 lh-1">
                  <div className="h6 mb-0">Email</div>
                  <span className="text-black-50">{selectedCustomer.email}</span>
                </div>
                <div className="d-flex flex-column gap-2 lh-1">
                  <div className="h6 mb-0">Phone Number</div>
                  <span className="text-black-50">{selectedCustomer.phone || '-'}</span>
                </div>
                <div className="d-flex flex-column gap-2">
                  <div className="h6 mb-0">Address</div>
                  <div>
                    {selectedCustomer.addresses && selectedCustomer.addresses.map((addr) => (
                      <div className="form-check" key={addr.id}>
                        <input className="form-check-input" type="radio" name="customerAddress" id={`addr-${addr.id}`} defaultChecked={addr.default} />
                        <label className="form-check-label" htmlFor={`addr-${addr.id}`}>{addr.text}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                 <div className="card">
                 <div className="bg-light rounded-top px-4 py-3">
                     <a
                         href={`#collapseOrderHistoryCustomer${selectedCustomer.id}`} // Perbaiki href agar valid
                         className="d-flex align-items-center justify-content-between text-inherit"
                         data-bs-toggle="collapse"
                         data-bs-target={`#collapseOrderHistoryCustomer${selectedCustomer.id}`}
                         aria-expanded={true} 
                         aria-controls={`collapseOrderHistoryCustomer${selectedCustomer.id}`}
                     >
                         <div className="d-flex flex-row align-items-center gap-2">
                             <h3 className="mb-0 h5">Orders</h3>
                             <span className="text-black-50 lh-1">{selectedCustomer.orders[0].orderDisplayId}</span>
                         </div>
                         <div className="d-flex flex-row gap-6 align-items-center">
                             <div>
                                 <span className="text-inherit">Date: <span className="text-dark">{selectedCustomer.orders[0].date}</span></span>
                             </div>
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down chevron-down" viewBox="0 0 16 16">
                                 <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                             </svg>
                         </div>
                     </a>
                 </div>
                 <div className="card-body py-0 px-4">
                     <div className="accordion d-flex flex-column" id={`accordionOrderHistoryCustomer${selectedCustomer.id}`}>
                         <div id={`collapseOrderHistoryCustomer${selectedCustomer.id}`} className="accordion-collapse collapse show" data-bs-parent={`#accordionOrderHistoryCustomer${selectedCustomer.id}`}>
                             <ul className="list-group list-group-flush mb-0">
                                 {selectedCustomer.orders.map(orderItem => (
                                     <li className="list-group-item px-0 py-1" key={orderItem.id}>
                                         <Link to={`/dashboard/orders/${orderItem.orderIdLink}`} className="text-inherit d-flex flex-row align-items-center justify-content-between">
                                             <div className="d-flex flex-row justify-content-between gap-3 align-items-center">
                                                 <img src={orderItem.imgSrc} className="icon-shape icon-xxl" alt={orderItem.name} />
                                                 <span className="h6 mb-0">{orderItem.name}</span>
                                             </div>
                                             <span className="text-black-50">{orderItem.amount}</span>
                                         </Link>
                                     </li>
                                 ))}
                                  <li className="list-group-item px-0 py-3">
                                      <div className="d-flex flex-row justify-content-between">
                                          <span className="text-dark fw-semibold">Total Order Amount</span>
                                          <span className="text-dark fw-semibold">{selectedCustomer.totalOrderAmount}</span>
                                      </div>
                                  </li>
                             </ul>
                         </div>
                     </div>
                 </div>
             </div>
            )}
          </div>
        ) : (
            <div className="offcanvas-body">
                <p>Click "View" on a customer in the table to see their details.</p>
            </div>
        )}
      </div>
    </>
  );
};

export default Customers;