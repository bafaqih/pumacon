import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import api from '../services/api';

const Products = () => {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const defaultProductImage = '/assets/images/products/default-image.jpg';
  const backendAssetBaseUrl = 'http://localhost:8080';

  const getProductImageUrl = (imagesArray) => {
    if (imagesArray && imagesArray.length > 0 && imagesArray[0].Image) {
      const imagePath = imagesArray[0].Image;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
      return `${backendAssetBaseUrl}/${cleanPath}`;
    }
    return defaultProductImage;
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Rp -';
    return `Rp${Number(price).toLocaleString('id-ID')}`; 
  };

  const getStatusClass = (status) => {
    if (!status) return 'bg-light-secondary text-dark-secondary';
    if (status.toLowerCase() === 'published') {
      return 'bg-light-success text-dark-success'; 
    } else if (status.toLowerCase() === 'unpublished') {
      return 'bg-light-warning text-dark-warning'; 
    }
    return 'bg-light-secondary text-dark-secondary';
  };

  const fetchProducts = useCallback(async () => {
    if (!token) {
      setError("Autentikasi dibutuhkan."); setLoading(false); return;
    }
    setLoading(true); setError(''); setSuccessMessage('');
    try {
      const response = await api.get('/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductsList(response.data.products || response.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      if (err.response && err.response.status === 401) {
        setError("Sesi Anda tidak valid. Silakan login kembali.");
        logout(); navigate('/dashboard/login', { replace: true });
      } else {
        setError(err.response?.data?.error || "Gagal mengambil daftar produk.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate, logout]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (productSKU, productName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus produk "${productName}" (SKU: ${productSKU})?`)) {
      return;
    }
    if (!token) { setError("Autentikasi dibutuhkan."); return; }
    setError(''); setSuccessMessage('');

    try {
      await api.delete(`/admin/products/${productSKU}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage(`Produk "${productName}" berhasil dihapus.`);
      setProductsList(prevList => prevList.filter(p => p.ProductSKU !== productSKU));
    } catch (err) {
      console.error(`Error deleting product ${productSKU}:`, err);
      if (err.response && err.response.status === 401) {
        setError("Sesi Anda tidak valid."); logout(); navigate('/dashboard/login', { replace: true });
      } else {
        setError(err.response?.data?.error || `Gagal menghapus produk ${productSKU}.`);
      }
    }
  };

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-md-flex justify-content-between align-items-center">
              <div>
                <h2>Product List</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Product List</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/products/add-product" className="btn btn-primary">Add Product</Link>
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
                  <div className="col-lg-4 col-md-6 col-12 mb-2 mb-lg-0">
                    <form className="d-flex" role="search">
                      <input className="form-control" type="search" placeholder="Search Products" aria-label="Search" />
                    </form>
                  </div>
                  <div className="col-lg-2 col-md-4 col-12">
                    <select className="form-select">
                      <option value="">All Status</option>
                      <option value="Published">Published</option>
                      <option value="Unpublished">Unpublished</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {loading && <p className="p-4 text-center">Loading products...</p>}
                {!loading && !error && productsList.length === 0 && (
                  <p className="p-4 text-center">No products found.</p>
                )}
                {!loading && !error && productsList.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-centered table-hover text-nowrap table-borderless mb-0 table-with-checkbox">
                      <thead className="bg-light">
                        <tr>
                          <th><div className="form-check"><input className="form-check-input" type="checkbox" id="checkAllProducts" /><label className="form-check-label" htmlFor="checkAllProducts"></label></div></th>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsList.map((product) => (
                          <tr key={product.ProductSKU}>
                            <td><div className="form-check"><input className="form-check-input" type="checkbox" id={`product-${product.ProductSKU}`} /><label className="form-check-label" htmlFor={`product-${product.ProductSKU}`}></label></div></td>
                            <td>
                              <Link to={`/dashboard/products/${product.ProductSKU}/edit`}>
                                <img 
                                  src={getProductImageUrl(product.Images)} 
                                  alt={product.Title} 
                                  className="icon-shape icon-md" 
                                  onError={(e) => { e.target.onerror = null; e.target.src=defaultProductImage; }}
                                />
                              </Link>
                            </td>
                            <td><Link to={`/dashboard/products/${product.ProductSKU}/edit`} className="text-reset">{product.Title}</Link></td>
                            <td>{product.ProductCategory?.CategoryName || 'N/A'}</td>
                            <td><span className={`badge ${getStatusClass(product.Status)}`}>{product.Status}</span></td>
                            <td>{formatPrice(product.RegularPrice)}</td>
                            <td>{product.Stock < 0 ? 0 : product.Stock}</td>
                            <td>
                              <div className="dropdown">
                                <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                                  <i className="feather-icon icon-more-vertical fs-5"></i>
                                </Link>
                                <ul className="dropdown-menu">
                                  <li><Link className="dropdown-item" to={`/dashboard/products/${product.ProductSKU}/edit`}><i className="bi bi-pencil-square me-3"></i> Edit</Link></li>
                                  <li>
                                    <button className="dropdown-item text-danger" onClick={() => handleDeleteProduct(product.ProductSKU, product.Title)}>
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
                {!loading && !error && productsList.length > 0 && (
                   <div className="border-top d-flex justify-content-between align-items-md-center px-6 py-6 flex-md-row flex-column gap-4">
                      <span>Showing 1 to {productsList.length} of {productsList.length} entries</span>
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

export default Products;