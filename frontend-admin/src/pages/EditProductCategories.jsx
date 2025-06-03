// src/pages/EditProductCategories.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path jika perlu
import api from '../services/api'; // Sesuaikan path jika perlu

const EditProductCategories = () => {
  const { categoryId: paramCategoryId } = useParams(); // Ambil categoryId dari URL
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // State untuk loading dan pesan
  const [loading, setLoading] = useState(false);         // Untuk proses submit
  const [loadingData, setLoadingData] = useState(true); // Untuk fetch data awal
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // State untuk form fields
  const [categoryIdDisplay, setCategoryIdDisplay] = useState(''); // Untuk menampilkan Category ID (read-only)
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('published'); 
  const [validated, setValidated] = useState(false);

  // useEffect untuk mengambil data kategori yang akan diedit
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!paramCategoryId || !token) {
        setErrorMessage("Category ID tidak valid atau Anda tidak terautentikasi.");
        setLoadingData(false);
        if (!token) navigate('/dashboard/login', { replace: true });
        return;
      }
      setLoadingData(true);
      setErrorMessage('');
      try {
        // Panggil API untuk mendapatkan detail kategori produk
        const response = await api.get(`/admin/product-categories/${paramCategoryId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Asumsi backend mengembalikan { category: {...} } atau langsung objek category
        const cat = response.data.category || response.data; 
        if (cat) {
          setCategoryIdDisplay(cat.CategoryID); // CategoryID dari data backend
          setCategoryName(cat.CategoryName || '');
          setDescription(cat.Description || '');
          setStatus(cat.Status || 'published'); // Sesuaikan dengan nilai status dari backend
        } else {
          setErrorMessage(`Kategori produk dengan ID ${paramCategoryId} tidak ditemukan.`);
        }
      } catch (err) {
        console.error("Error fetching product category data for edit:", err);
        if (err.response && err.response.status === 401) {
          setErrorMessage('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
          logout();
          navigate('/dashboard/login', { replace: true });
        } else {
          setErrorMessage(err.response?.data?.error || `Gagal mengambil data kategori ${paramCategoryId}.`);
        }
      } finally {
        setLoadingData(false);
      }
    };
    if (paramCategoryId) {
        fetchCategoryData();
    }
  }, [paramCategoryId, token, navigate, logout]);

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
        setErrorMessage("Autentikasi dibutuhkan.");
        logout();
        navigate('/dashboard/login', {replace: true});
        setLoading(false);
        return;
    }

    // Data yang akan dikirim ke backend untuk diupdate
    const categoryDataToUpdate = {
      // CategoryID tidak dikirim di body JSON, karena ada di URL dan tidak boleh diubah
      category_name: categoryName,
      description: description,
      status: status, // "published" atau "unpublished"
    };

    try {
      // Panggil API PUT untuk update kategori produk
      const response = await api.put(`/admin/product-categories/${paramCategoryId}`, categoryDataToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSuccessMessage(response.data.message || 'Kategori produk berhasil diupdate!');
      setValidated(false);
      // Opsional: Arahkan kembali ke daftar kategori setelah beberapa detik
      setTimeout(() => {
        navigate('/dashboard/products/categories');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setErrorMessage('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        logout();
        navigate('/dashboard/login', {replace: true});
      } else {
        setErrorMessage(err.response?.data?.error || 'Gagal mengupdate kategori produk. Terjadi kesalahan.');
      }
      console.error('Update product category error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingData) {
    return (
      <main className="main-content-wrapper">
        <div className="container text-center p-5">Memuat data kategori...</div>
      </main>
    );
  }

  if (errorMessage && !categoryName && !loadingData) { 
      return (
          <main className="main-content-wrapper">
              <div className="container">
                  <div className="alert alert-danger mt-3" role="alert">{errorMessage}</div>
                  <Link to="/dashboard/products/categories" className="btn btn-secondary">Kembali ke Daftar Kategori</Link>
              </div>
          </main>
      );
  }

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-md-flex justify-content-between align-items-center">
              <div>
                <h2>Edit Product Category <span className="text-muted fs-5">({categoryIdDisplay || '...'})</span></h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/products" className="text-inherit">Products</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/products/categories" className="text-inherit">Product Categories</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Edit Category</li>
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
        {errorMessage && !loadingData && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
        
        <form onSubmit={handleSubmit} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`}>
          <div className="row">
            <div className="col-lg-12 col-12">
              <div className="card mb-6 shadow border-0">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5 mt-0">Category Information</h4>
                  <div className="row">
                    {/* Category ID (Read-Only) */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="categoryIdDisplayInput">Category ID</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="categoryIdDisplayInput" 
                        value={categoryIdDisplay} 
                        readOnly 
                        disabled
                        style={{ backgroundColor: '#e9ecef' }}
                      />
                    </div>

                    {/* Category Name */}
                    <div className="mb-3 col-lg-6"> {/* Dibuat sejajar dengan ID */}
                      <label className="form-label" htmlFor="categoryNameInput">Category Name <span className="text-danger">*</span></label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Category Name" 
                        id="categoryNameInput" 
                        value={categoryName} 
                        onChange={(e) => setCategoryName(e.target.value)} 
                        required 
                        disabled={loading || loadingData}
                      />
                      <div className="invalid-feedback">Please enter category name.</div>
                    </div>
                    
                    {/* Descriptions */}
                    <div className="mb-3 col-lg-12" style={{minHeight: '250px', marginBottom: '40px'}}>
                      <label className="form-label">Description</label>
                        <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        style={{ height: '150px' }} 
                        placeholder="Write category description here..."
                        readOnly={loading || loadingData}
                      />
                    </div>

                    {/* Status */}
                    <div className="mb-3 col-lg-12 mt-3">
                      <label className="form-label d-block" id="categoryStatusLabelEdit">Status <span className="text-danger">*</span></label>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="categoryStatusRadioEdit"
                            id="statusPublishedEditCat"
                            value="published"
                            checked={status === 'published'} 
                            onChange={(e) => setStatus(e.target.value)} 
                            disabled={loading || loadingData}
                        />
                        <label className="form-check-label" htmlFor="statusPublishedEditCat">Published</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="categoryStatusRadioEdit" 
                            id="statusUnpublishedEditCat"
                            value="unpublished"
                            checked={status === 'unpublished'} 
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={loading || loadingData}
                        />
                        <label className="form-check-label" htmlFor="statusUnpublishedEditCat">Unpublished</label>
                      </div>
                    </div>
                    
                    {/* Tombol Aksi */}
                    <div className="col-lg-12 mt-4">
                      <button type="submit" className="btn btn-primary" disabled={loading || loadingData}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <Link to="/dashboard/products/categories" className="btn btn-secondary ms-2" disabled={loading || loadingData}>
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

export default EditProductCategories;