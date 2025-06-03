import React from 'react';
import { Link } from 'react-router-dom';

const NewsCategories = () => {
  // Data kategori ini bisa berasal dari API call nantinya.
  // Untuk sekarang, kita buat sebagai array objek untuk contoh.
  // Field iconSrc tetap ada di data, meskipun tidak ditampilkan di tabel ini,
  // karena mungkin digunakan di halaman lain (misalnya edit kategori).
  const categoriesData = [
    {
      id: 'categoryOne',
      iconSrc: '/assets/images/icons/snacks.svg', // Tetap ada di data
      name: "Snack & Munchies",
      newsCount: 12,
      status: 'Published',
      statusClass: 'bg-light-primary text-dark-primary',
    },
    {
      id: 'categoryTwo',
      iconSrc: '/assets/images/icons/bakery.svg', // Tetap ada di data
      name: "Bakery & Biscuits",
      newsCount: 8,
      status: 'Published',
      statusClass: 'bg-light-primary text-dark-primary',
    },
    {
      id: 'categoryThree',
      iconSrc: '/assets/images/icons/baby-food.svg', // Tetap ada di data
      name: "Baby Care",
      newsCount: 32,
      status: 'Published',
      statusClass: 'bg-light-primary text-dark-primary',
    },
    {
      id: 'categoryFour',
      iconSrc: '/assets/images/icons/wine.svg', // Tetap ada di data
      name: "Cold Drinks & Juices",
      newsCount: 34,
      status: 'Published',
      statusClass: 'bg-light-primary text-dark-primary',
    },
    {
      id: 'categoryFive',
      iconSrc: '/assets/images/icons/toiletries.svg', // Tetap ada di data
      name: "Toiletries",
      newsCount: 23,
      status: 'Unpublished',
      statusClass: 'bg-light-danger text-dark-danger',
    },
    {
      id: 'categorySeven',
      iconSrc: '/assets/images/icons/dairy.svg', // Tetap ada di data
      name: "Dairy, Bread & Eggs",
      newsCount: 16,
      status: 'Published',
      statusClass: 'bg-light-primary text-dark-primary',
    },
    {
      id: 'categoryEight',
      iconSrc: '/assets/images/icons/fish.svg', // Tetap ada di data
      name: "Chicken, Meat & Fish",
      newsCount: 14,
      status: 'Published',
      statusClass: 'bg-light-primary text-dark-primary',
    },
    {
      id: 'categoryNine',
      iconSrc: '/assets/images/icons/fruit.svg', // Tetap ada di data
      name: "Fruits & Vegetables",
      newsCount: 32,
      status: 'Published',
      statusClass: 'bg-light-primary text-dark-primary',
    },
    {
      id: 'categoryTen',
      iconSrc: '/assets/images/icons/petfoods.svg', // Tetap ada di data
      name: "Pet Food",
      newsCount: 25,
      status: 'Unpublished',
      statusClass: 'bg-light-danger text-dark-danger',
    },
  ];

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
              <div>
                <h2>News Categories</h2> {/* Menggunakan nama dari kode Anda */}
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/news" className="text-inherit">News</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">News Categories</li> {/* Disesuaikan */}
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/news/categories/add-category" className="btn btn-primary">Add New Category</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12 col-12 mb-5">
            <div className="card h-100 card-lg">
              <div className="px-6 py-6">
                <div className="row justify-content-between">
                  <div className="col-lg-4 col-md-6 col-12 mb-2 mb-md-0">
                    <form className="d-flex" role="search">
                      <input className="form-control" type="search" placeholder="Search Category" aria-label="Search" />
                    </form>
                  </div>
                  <div className="col-xl-2 col-md-4 col-12">
                    <select className="form-select">
                      <option>Status</option>
                      <option value="Published">Published</option>
                      <option value="Unpublished">Unpublished</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-centered table-hover mb-0 text-nowrap table-borderless table-with-checkbox">
                    <thead className="bg-light">
                      <tr>
                        <th>
                          <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="checkAll" />
                            <label className="form-check-label" htmlFor="checkAll"></label>
                          </div>
                        </th>
                        {/* <th>Icon</th> KOLOM IKON DIHAPUS */}
                        <th>Name</th>
                        <th>News</th>
                        <th>Status</th>
                        <th></th> {/* Kolom untuk action dropdown */}
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesData.map((category) => (
                        <tr key={category.id}>
                          <td>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" value="" id={category.id} />
                              <label className="form-check-label" htmlFor={category.id}></label>
                            </div>
                          </td>
                          {/* <td>
                             KOLOM IKON DAN ISINYA DIHAPUS
                            <Link to={`/dashboard/product-categories/${category.id}/edit`}><img src={category.iconSrc} alt={category.name} className="icon-shape icon-sm" /></Link>
                          </td> */}
                          <td><Link to={`/dashboard/news/categories/${category.id}/edit`} className="text-reset">{category.name}</Link></td>
                          <td>{category.newsCount}</td>
                          <td>
                            <span className={`badge ${category.statusClass}`}>{category.status}</span>
                          </td>
                          <td>
                            <div className="dropdown">
                              <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                                <i className="feather-icon icon-more-vertical fs-5"></i>
                              </Link>
                              <ul className="dropdown-menu">
                                <li>
                                  <Link className="dropdown-item" to="#"> {/* Fungsi delete perlu implementasi */}
                                    <i className="bi bi-trash me-3"></i> Delete
                                  </Link>
                                </li>
                                <li>
                                  <Link className="dropdown-item" to={`/dashboard/news/categories/${category.id}/edit`}>
                                    <i className="bi bi-pencil-square me-3"></i> Edit
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
              <div className="border-top d-flex justify-content-between align-items-md-center px-6 py-6 flex-md-row flex-column gap-4">
                <span>Showing 1 to {categoriesData.length} of {categoriesData.length} entries</span>
                <nav>
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

export default NewsCategories; // Nama komponen sesuai kode Anda