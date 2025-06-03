import React, { useEffect, useRef } from 'react';

const AccountOrder = () => {
  const selectStatusRef = useRef(null);
  const selectTimeRef = useRef(null);

  useEffect(() => {
    // Komentari atau hapus bagian Choices.js jika tidak digunakan
    // agar tidak menyebabkan error jika library tidak ada.
    // Jika Anda ingin menggunakannya, pastikan Choices.js sudah di-load
    // dan diinisialisasi dengan benar.
  }, []);

  const orders = [
    {
      id: "78A6543D210",
      status: "In progress",
      statusColor: "info",
      images: [
        "/assets/images/product/product-img-1.jpg",
        "/assets/images/product/product-img-2.jpg",
        "/assets/images/product/product-img-3.jpg",
      ],
      estimatedArrival: "Feb 6, 2025",
      value: "$69.00",
    },
    {
      id: "56H78G90F12",
      status: "Delivered",
      statusColor: "success",
      images: [
        "/assets/images/product/product-img-4.jpg",
        "/assets/images/product/product-img-5.jpg",
        "/assets/images/product/product-img-6.jpg",
      ],
      estimatedArrival: "Des 12, 2024",
      value: "$369.00",
    },
    {
      id: "45C6789D123",
      status: "Canceled",
      statusColor: "danger",
      images: [
        "/assets/images/product/product-img-9.jpg",
        "/assets/images/product/product-img-10.jpg",
      ],
      estimatedArrival: "Feb 6, 2025",
      value: "$69.00",
    },
    {
      id: "12H34G56F78",
      status: "Delivered",
      statusColor: "success",
      images: [
        "/assets/images/product/product-img-2.jpg",
        "/assets/images/product/product-img-3.jpg",
        "/assets/images/product/product-img-4.jpg",
      ],
      estimatedArrival: "Des 12, 2024",
      value: "$369.00",
    },
  ];

  return (
    <div className="col-lg-9 col-md-8">
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <h1 className="mb-0 h2">Orders</h1>
        </div>
        <div className="col-lg-3 col-md-6 col-12">
          <select
            ref={selectStatusRef}
            className="form-select"
            aria-label="Select Order Status"
          >
            <option value="In progress">In progress</option>
            <option value="Canceled">Canceled</option>
            <option value="Delivered">Delivered</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
        <div className="col-lg-3 col-md-6 col-12">
          <select
            ref={selectTimeRef}
            className="form-select"
            aria-label="Select Time Period"
          >
            <option value="all-time">For all time</option>
            <option value="last-year">For last year</option>
            <option value="last-3-months">For last 3 months</option>
            <option value="last-30-days">For last 30 days</option>
            <option value="last-week">For last week</option>
          </select>
        </div>
      </div>

      {orders.map((order) => (
        // 1. Tambahkan kelas rounded-0 di sini
        <div className="card mb-3 rounded-0" key={order.id}>
          <div className="card-header d-flex justify-content-between align-items-center px-3 py-3">
            <span className="text-dark fw-semibold">Order ID: {order.id}</span>
            <span className={`badge text-bg-${order.statusColor}`}>{order.status}</span>
          </div>
          <div className="card-body px-3 py-3">
            <div className="row gy-4 align-items-center"> {/* Menambah align-items-center di sini untuk keseluruhan baris */}
              <div className="col-lg-5">
                <div className="d-flex gap-2">
                  {order.images.slice(0,3).map((imgSrc, imgIndex) => ( // Batasi maks 3 gambar
                    <img
                      key={imgIndex}
                      src={imgSrc}
                      alt={`Product ${imgIndex + 1} for order ${order.id}`}
                      className="icon-shape icon-xl"
                    />
                  ))}
                </div>
              </div>
              {/* 2. Modifikasi struktur kolom ini */}
              <div className="col-lg-7">
                {/* Tambahkan justify-content-lg-end untuk menggeser grup kolom ke kanan di layar besar */}
                <div className="row align-items-center gy-3 justify-content-lg-end">
                  <div className="col-lg-auto col-md-4 col-sm-6"> {/* Menggunakan col-lg-auto agar lebarnya sesuai konten */}
                    {/* Tambahkan text-lg-end untuk meratakan teks ke kanan di layar besar */}
                    <div className="d-flex flex-column text-lg-end">
                      <span>Estimated Arrival</span>
                      <span className="text-dark fw-medium">{order.estimatedArrival}</span>
                    </div>
                  </div>
                  <div className="col-lg-auto col-md-4 col-sm-6"> {/* Menggunakan col-lg-auto */}
                     {/* Tambahkan text-lg-end */}
                    <div className="d-flex flex-column text-lg-end">
                      <span>Order value</span>
                      <span className="text-dark fw-medium">{order.value}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div>
        <nav aria-label="Page navigation example">
          <ul className="pagination">
            <li className="page-item">
              <a className="page-link" href="#!" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li className="page-item"><a className="page-link active" href="#!">1</a></li>
            <li className="page-item"><a className="page-link" href="#!">2</a></li>
            <li className="page-item"><a className="page-link" href="#!">3</a></li>
            <li className="page-item">
              <a className="page-link" href="#!" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AccountOrder;