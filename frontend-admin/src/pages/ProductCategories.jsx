// src/pages/ProductCategories.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path jika perlu
import api from '../services/api'; // Sesuaikan path jika perlu

const ProductCategories = () => {
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Untuk pesan sukses (misal setelah delete)

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // Fungsi untuk menentukan kelas badge berdasarkan status
  const getStatusClass = (status) => {
    if (!status) return 'bg-light-secondary text-dark-secondary';
    // Sesuaikan value status jika berbeda dengan 'Published'/'Unpublished'
    // Misal, jika backend mengembalikan 'active'/'inactive'
    if (status.toLowerCase() === 'published' || status.toLowerCase() === 'active') {
      return 'bg-light-primary text-dark-primary'; // Atau bg-light-success text-dark-success
    } else if (status.toLowerCase() === 'unpublished' || status.toLowerCase() === 'inactive') {
      return 'bg-light-danger text-dark-danger';
    }
    return 'bg-light-secondary text-dark-secondary';
  };

  // Fungsi untuk mengambil daftar kategori produk
  const fetchProductCategories = useCallback(async () => {
    if (!token) {
      setError("Autentikasi dibutuhkan untuk melihat data kategori produk.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      // Endpoint ini akan kita buat di backend
      const response = await api.get('/admin/product-categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Asumsi backend mengembalikan { categories: [...] } atau langsung array [...]
      // Setiap kategori HARUS memiliki CategoryID, CategoryName, ProductsCount (jika ada dari backend), Status
      setCategoriesList(response.data.categories || response.data || []);
    } catch (err) {
      console.error("Error fetching product categories:", err);
      if (err.response && err.response.status === 401) {
        setError("Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.");
        logout();
        navigate('/dashboard/login', { replace: true });
      } else {
        setError(err.response?.data?.error || "Gagal mengambil daftar kategori produk.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate, logout]);

  useEffect(() => {
    fetchProductCategories();
  }, [fetchProductCategories]);

  // Fungsi untuk menangani delete kategori produk
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryName}" (ID: ${categoryId})? Ini mungkin mempengaruhi produk yang terkait.`)) {
      return;
    }
    if (!token) {
      setError("Autentikasi dibutuhkan.");
      return;
    }
    setError('');
    setSuccessMessage('');
    try {
      // Endpoint ini akan kita buat di backend
      await api.delete(`/admin/product-categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage(`Kategori "${categoryName}" berhasil dihapus.`);
      setCategoriesList(prevList => prevList.filter(cat => cat.CategoryID !== categoryId)); // Gunakan CategoryID
    } catch (err) {
      console.error(`Error deleting category ${categoryId}:`, err);
      if (err.response && err.response.status === 401) {
        setError("Sesi Anda tidak valid. Silakan login kembali.");
        logout();
        navigate('/dashboard/login', { replace: true });
      } else {
        setError(err.response?.data?.error || `Gagal menghapus kategori ${categoryId}.`);
      }
    }
  };

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
              <div>
                <h2>Product Categories</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/products" className="text-inherit">Products</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Product Categories</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/products/categories/add-category" className="btn btn-primary">Add New Category</Link>
              </div>
            </div>
          </div>
        </div>

        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

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
                      <option value="">All Status</option>
                      <option value="active">Active</option> {/* Sesuaikan value jika backend pakai active/inactive */}
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {loading && <p className="p-4 text-center">Loading categories...</p>}
                {!loading && !error && categoriesList.length === 0 && (
                  <p className="p-4 text-center">No product categories found.</p>
                )}
                {!loading && !error && categoriesList.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-centered table-hover mb-0 text-nowrap table-borderless table-with-checkbox">
                      <thead className="bg-light">
                        <tr>
                          <th>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" value="" id="checkAllCategories" />
                              <label className="form-check-label" htmlFor="checkAllCategories"></label>
                            </div>
                          </th>
                          <th>Name</th>
                          <th>Products</th> {/* Ini akan menjadi jumlah produk dalam kategori ini */}
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoriesList.map((category) => (
                          // Ganti category.id dengan category.CategoryID (sesuai model backend)
                          <tr key={category.CategoryID}> 
                            <td>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" value="" id={`category-${category.CategoryID}`} />
                                <label className="form-check-label" htmlFor={`category-${category.CategoryID}`}></label>
                              </div>
                            </td>
                            <td>
                              <Link to={`/dashboard/products/categories/${category.CategoryID}/edit`} className="text-reset">
                                {category.CategoryName} {/* Ganti category.name menjadi category.CategoryName */}
                              </Link>
                            </td>
                            {/* Ganti category.productsCount menjadi category.ProductsCount atau nama field yang sesuai dari API */}
                            <td>{category.ProductsCount !== undefined ? category.ProductsCount : '-'}</td> 
                            <td>
                              <span className={`badge ${getStatusClass(category.Status)}`}>{category.Status}</span>
                            </td>
                            <td>
                              <div className="dropdown">
                                <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                                  <i className="feather-icon icon-more-vertical fs-5"></i>
                                </Link>
                                <ul className="dropdown-menu">
                                  <li>
                                    <Link className="dropdown-item" to={`/dashboard/products/categories/${category.CategoryID}/edit`}>
                                      <i className="bi bi-pencil-square me-3"></i> Edit
                                    </Link>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item text-danger"
                                      onClick={() => handleDeleteCategory(category.CategoryID, category.CategoryName)}
                                    >
                                      <i className="bi bi-trash me-3"></i> Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {!loading && !error && categoriesList.length > 0 && (
                   <div className="border-top d-flex justify-content-between align-items-md-center px-6 py-6 flex-md-row flex-column gap-4">
                      <span>Showing 1 to {categoriesList.length} of {categoriesList.length} entries</span> {/* Perlu pagination backend */}
                      <nav>
                          <ul className="pagination mb-0">
                              <li className="page-item disabled"><Link className="page-link" to="#!">Previous</Link></li>
                              <li className="page-item"><Link className="page-link active" to="#!">1</Link></li>
                              <li className="page-item"><Link className="page-link" to="#!">Next</Link></li>
                          </ul>
                      </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductCategories;