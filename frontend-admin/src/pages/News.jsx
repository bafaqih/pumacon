import React from 'react';
import { Link } from 'react-router-dom';

const News = () => {
  // Data berita/artikel ini bisa berasal dari API call nantinya.
  // ID akan digunakan untuk parameter di URL.
  const newsData = [
    {
      id: 'news-1',
      imgSrc: '/assets/images/blog/blog-img-1.jpg', // Path ke public folder
      status: 'Draft',
      statusClass: 'bg-light-danger text-dark-danger',
      title: "Garlic Cream Bucatini with Peas and Asparagus",
      date: '05 June, 2024', // Tanggal diubah agar lebih relevan dengan "News"
      readTime: '7min', // Read time disesuaikan
      publicViewLink: '/news/news-1', // Link ke halaman publik news
    },
    {
      id: 'news-2',
      imgSrc: '/assets/images/blog/blog-img-2.jpg',
      status: 'Published',
      statusClass: 'bg-light-success text-dark-success',
      title: "Harissa Chickpeas with Whipped Feta",
      date: '02 June, 2024',
      readTime: '10min',
      publicViewLink: '/news/news-2',
    },
    {
      id: 'news-3',
      imgSrc: '/assets/images/blog/blog-img-3.jpg',
      status: 'Published',
      statusClass: 'bg-light-success text-dark-success',
      title: "Almond Butter Chocolate Chip Zucchini Bars",
      date: '01 June, 2024',
      readTime: '8min',
      publicViewLink: '/news/news-3',
    },
    {
      id: 'news-4',
      imgSrc: '/assets/images/blog/blog-img-4.jpg',
      status: 'Published',
      statusClass: 'bg-light-success text-dark-success',
      title: "Spicy Shrimp Tacos Garlic Cilantro Lime Slaw",
      date: '26 May, 2024',
      readTime: '12min',
      publicViewLink: '/news/news-4',
    },
    {
      id: 'news-5',
      imgSrc: '/assets/images/blog/blog-img-5.jpg',
      status: 'Published',
      statusClass: 'bg-light-success text-dark-success',
      title: "Red Chile Chicken Tacos with Creamy Corn",
      date: '24 May, 2024',
      readTime: '9min',
      publicViewLink: '/news/news-5',
    },
    {
      id: 'news-6',
      imgSrc: '/assets/images/blog/blog-img-8.jpg', // Di HTML aslinya blog-img-8
      status: 'Published',
      statusClass: 'bg-light-success text-dark-success',
      title: "Basic + Awesome Broccoli Cheese Soup",
      date: '20 May, 2024',
      readTime: '6min',
      publicViewLink: '/news/news-6',
    },
    {
      id: 'news-7',
      imgSrc: '/assets/images/blog/blog-img-6.jpg', // Di HTML aslinya blog-img-6
      status: 'Draft',
      statusClass: 'bg-light-danger text-dark-danger',
      title: "No-Boil Baked Penne with Meatballs",
      date: '15 May, 2024',
      readTime: '11min',
      publicViewLink: '/news/news-7',
    },
    {
      id: 'news-8',
      imgSrc: '/assets/images/blog/blog-img-7.jpg', // Di HTML aslinya blog-img-7
      status: 'Published',
      statusClass: 'bg-light-success text-dark-success',
      title: "Red Chile Chicken Tacos", // Disederhanakan
      date: '10 May, 2024',
      readTime: '12min',
      publicViewLink: '/news/news-8',
    },
    {
      id: 'news-9',
      imgSrc: '/assets/images/blog/blog-img-9.jpg',
      status: 'Published',
      statusClass: 'bg-light-success text-dark-success',
      title: "Awesome Broccoli Cheese Soup", // Disederhanakan
      date: '08 May, 2024',
      readTime: '5min',
      publicViewLink: '/news/news-9',
    },
  ];

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-9"> {/* Di HTML mb-9, saya pertahankan */}
          <div className="col-md-12">
            <div className="d-flex flex-row justify-content-between align-items-center">
              <div>
                <h2>News Grid</h2> {/* Judul diubah ke News */}
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">News</li> {/* Breadcrumb diubah */}
                  </ol>
                </nav>
              </div>
              <div>
                {/* Path diubah ke add-post */}
                <Link to="/dashboard/news/add-post" className="btn btn-primary">New Post</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12 col-12 mb-9"> {/* Di HTML mb-9 */}
            <div className="row justify-content-between d-flex flex-md-row flex-column gap-2">
              <div className="col-lg-4 col-md-4 col-12">
                <form className="d-flex" role="search">
                  <label htmlFor="postSearch" className="form-label visually-hidden">Search Post</label>
                  <input className="form-control" type="search" placeholder="Search News Post" aria-label="Search" id="postSearch" />
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-6">
          {newsData.map((newsItem) => (
            <div className="col-lg-4 col-md-6 col-12" key={newsItem.id}>
              <div className="card card-lg rounded-4 border-0 card-lift h-100">
                {/* Link gambar artikel sekarang mengarah ke path publik view */}
                <Link to={newsItem.publicViewLink} className="img-zoom rounded-bottom-0" target="_blank" rel="noopener noreferrer">
                    <img src={newsItem.imgSrc} alt={newsItem.title} className="img-fluid rounded-top-4 w-100" style={{objectFit: 'cover', height: '200px'}} /> {/* Style untuk tinggi gambar konsisten */}
                </Link>
                <div className="card-body d-flex flex-column gap-4 p-6">
                  <div className="d-flex flex-row justify-content-between align-items-center">
                    <span className={`badge ${newsItem.statusClass}`}>{newsItem.status}</span>
                    <div>
                      <div className="dropdown">
                        <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                          <i className="feather-icon icon-more-vertical fs-5"></i>
                        </Link>
                        <ul className="dropdown-menu">
                          <li>
                            {/* Link View mengarah ke path publik */}
                            <Link className="dropdown-item" to={newsItem.publicViewLink} target="_blank" rel="noopener noreferrer">
                              <i className="bi bi-eye-fill me-3"></i>View
                            </Link>
                          </li>
                          <li>
                            {/* Link Edit mengarah ke path admin edit */}
                            <Link className="dropdown-item" to={`/dashboard/news/${newsItem.id}/edit`}>
                              <i className="bi bi-pencil-square me-3"></i>Edit
                            </Link>
                          </li>
                          <li>
                            {/* Fungsi Delete perlu implementasi */}
                            <Link className="dropdown-item text-danger" to="#">
                              <i className="bi bi-trash me-3"></i>Delete
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <h3 className="mb-0 h5">
                    {/* Link judul artikel sekarang mengarah ke path publik view */}
                    <Link to={newsItem.publicViewLink} className="text-reset" target="_blank" rel="noopener noreferrer">{newsItem.title}</Link>
                  </h3>
                  <div className="d-flex flex-row justify-content-between align-items-center">
                    <small className="text-black-50">{newsItem.date}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
            <div className="col-12">
                <div>
                    <nav className="mt-7 mt-lg-10">
                        <ul className="pagination mb-0">
                            <li className="page-item disabled"><Link className="page-link" to="#!">Previous</Link></li>
                            <li className="page-item"><Link className="page-link active" to="#!">1</Link></li>
                            <li className="page-item"><Link className="page-link" to="#!">2</Link></li>
                            <li className="page-item"><Link className="page-link" to="#!">3</Link></li>
                            <li className="page-item"><Link className="page-link" to="#!">Next</Link></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
};

export default News;