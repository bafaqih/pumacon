import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AddProductCategories = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('published');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setValidated(true);

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setLoading(false);
      return;
    }

    if (!token) {
        setErrorMessage("Autentikasi dibutuhkan. Silakan login kembali.");
        setLoading(false);
        logout();
        navigate('/dashboard/login', {replace: true});
        return;
    }

    const categoryData = {
      category_name: categoryName,
      description: description,
      status: status,
    };

    try {
      const response = await api.post('/admin/add-product-category', categoryData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccessMessage(response.data.message || 'Kategori produk berhasil ditambahkan!');
      setCategoryName('');
      setDescription('');
      setStatus('published');
      setValidated(false);

      setTimeout(() => {
        navigate('/dashboard/products/categories');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setErrorMessage('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        logout();
        navigate('/dashboard/login', {replace: true});
      } else {
        setErrorMessage(err.response?.data?.error || 'Gagal menambahkan kategori produk. Terjadi kesalahan.');
      }
      console.error('Add product category error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-md-flex justify-content-between align-items-center">
              <div>
                <h2>Add New Product Category</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/products" className="text-inherit">Products</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/products/categories" className="text-inherit">Product Categories</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Add New Category</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/products/categories" className="btn btn-light">Back to Categories</Link>
              </div>
            </div>
          </div>
        </div>

        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}

        <form onSubmit={handleSubmit} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`}>
          <div className="row">
            <div className="col-lg-12 col-12">
              <div className="card mb-6 shadow border-0">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5 mt-0">Category Information</h4>
                  <div className="row">
                    <div className="mb-3 col-lg-12">
                      <label className="form-label" htmlFor="categoryNameInput">Category Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Category Name" 
                        id="categoryNameInput" 
                        value={categoryName} 
                        onChange={(e) => setCategoryName(e.target.value)} 
                        required 
                        disabled={loading}
                      />
                      <div className="invalid-feedback">Please enter category name.</div>
                    </div>
                    <div className="mb-3 col-lg-12" style={{minHeight: '250px', marginBottom: '40px'}}>
                      <label className="form-label">Description</label>
                        <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        style={{ height: '150px' }}
                        placeholder="Write category description here..."
                        readOnly={loading}
                      />
                    </div>
                    <div className="mb-3 col-lg-12">
                      <label className="form-label d-block" id="categoryStatusLabel">Status <span className="text-danger">*</span></label>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="categoryStatusRadio"
                            id="statusPublishedCat"
                            value="published"
                            checked={status === 'published'} 
                            onChange={(e) => setStatus(e.target.value)} 
                            disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="statusPublishedCat">Published</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="categoryStatusRadio" 
                            id="statusUnpublishedCat"
                            value="unpublished"
                            checked={status === 'unpublished'} 
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="statusUnpublishedCat">Unpublished</label>
                      </div>
                    </div>
                    <div className="col-lg-12 mt-4">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Category'}
                      </button>
                      <Link to="/dashboard/products/categories" className="btn btn-secondary ms-2" disabled={loading}>
                        Cancel
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddProductCategories;