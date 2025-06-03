// src/pages/AddProduct.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; 

const AddProduct = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // State untuk loading dan pesan
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validated, setValidated] = useState(false);

  // State untuk dropdown kategori produk
  const [productCategoriesOptions, setProductCategoriesOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // State untuk form fields produk
  const [title, setTitle] = useState(''); // Mengganti productName menjadi title
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState(''); // Untuk menyimpan ID kategori yang dipilih
  const [brand, setBrand] = useState('');
  const [powerSource, setPowerSource] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [productionDate, setProductionDate] = useState(''); // String YYYY-MM-DD
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(0);
  const [status, setStatus] = useState('Published'); // Status: Published atau Unpublished
  const [regularPrice, setRegularPrice] = useState('');
  
  const [files, setFiles] = useState([]); // Untuk react-dropzone (bisa multiple, tapi kita kirim 1 atau beberapa nanti)

  // --- useEffect untuk mengambil daftar kategori produk ---
  useEffect(() => {
    const fetchProductCategories = async () => {
      if (!token) {
        setCategoriesError("Autentikasi dibutuhkan untuk memuat kategori produk.");
        setLoadingCategories(false);
        return;
      }
      setLoadingCategories(true);
      setCategoriesError('');
      try {
        // Endpoint ini akan kita buat nanti: GET /admin/product-categories/list (hanya yg aktif)
        const response = await api.get('/admin/product-categories/list-active', { 
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductCategoriesOptions(response.data.categories || []);
      } catch (err) {
        console.error("Error fetching product categories:", err);
        if (err.response && err.response.status === 401) {
            setCategoriesError("Sesi Anda tidak valid. Silakan login kembali.");
            logout();
            navigate('/dashboard/login', {replace: true});
        } else {
            setCategoriesError(err.response?.data?.error || "Gagal memuat daftar kategori produk.");
        }
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchProductCategories();
  }, [token, navigate, logout]);


  // Fungsi untuk Dropzone
  const onDrop = useCallback(acceptedFiles => {
    // Ambil hanya file pertama jika maxFiles=1, atau semua jika ingin multiple image
    // Untuk contoh ini, kita akan fokus pada satu gambar utama dulu.
    // Jika ingin multiple, backend dan DB product_images perlu disiapkan.
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles].slice(0, 5)); // Batasi maks 5 gambar untuk contoh
  }, []);

  const { getRootProps, getInputProps, isDragAccept, isDragReject, isFocused } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
    // maxFiles: 1, // Jika hanya satu gambar utama
    maxSize: 5 * 1024 * 1024, // 5MB per file
  });

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  const removeFile = (fileName, e) => {
    e.stopPropagation();
    setFiles(files.filter(file => file.name !== fileName));
  };

  const thumbs = files.map(file => (
    <div className="thumb" key={file.name} style={{ display: 'inline-flex', borderRadius: 2, border: '1px solid #eaeaea', marginBottom: 8, marginRight: 8, width: 100, height: 100, padding: 4, boxSizing: 'border-box' }}>
      <div className="thumb-inner" style={{ display: 'flex', minWidth: 0, overflow: 'hidden', position: 'relative' }}>
        <img src={file.preview} className="thumb-img" alt={file.name} style={{ display: 'block', width: 'auto', height: '100%' }} onLoad={() => { URL.revokeObjectURL(file.preview); }} />
        <button type="button" className="btn btn-sm btn-danger" onClick={(e) => removeFile(file.name, e)} style={{ position: 'absolute', top: 0, right: 0, zIndex:1 }}>X</button>
      </div>
    </div>
  ));

  // Handle Submit Form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setValidated(true);

    const form = event.currentTarget;
    if (form.checkValidity() === false || selectedProductCategoryId === "") {
      event.stopPropagation();
      if (selectedProductCategoryId === "") setErrorMessage("Kategori produk wajib dipilih.");
      setLoading(false);
      return;
    }

    if (!token) {
      setErrorMessage("Autentikasi dibutuhkan..."); logout(); navigate('/dashboard/login', {replace: true}); setLoading(false); return;
    }

    const formDataPayload = new FormData();

    // 1. Data produk (JSON)
    const productData = {
      title: title,
      brand: brand,
      product_category_id: selectedProductCategoryId, // Kirim ID kategori
      power_source: powerSource,
      warranty_period: warrantyPeriod,
      production_date: productionDate, // Format YYYY-MM-DD
      descriptions: description, // Nama field disesuaikan dengan backend
      stock: parseInt(stock, 10) || 0,
      status: status, // Published atau Unpublished
      regular_price: parseFloat(regularPrice) || 0,
    };
    formDataPayload.append('jsonData', JSON.stringify(productData));

    // 2. Tambahkan file gambar (jika ada)
    // Backend akan menangani array file jika 'imageFiles[]' atau satu file jika 'imageFile'
    // Untuk saat ini, kita kirim multiple files jika ada
    files.forEach((file, index) => {
        formDataPayload.append(`imageFiles`, file); // Ganti 'imageFiles[]' jika backend Anda mengharapkan itu untuk array
    });


    try {
      const response = await api.post('/admin/products', formDataPayload, { // Endpoint API
        headers: { Authorization: `Bearer ${token}` },
        // Content-Type akan di-set otomatis oleh Axios untuk FormData
      });

      setSuccessMessage(response.data.message || 'Produk berhasil ditambahkan!');
      // Reset form
      setTitle(''); setSelectedProductCategoryId(''); setBrand(''); setPowerSource('');
      setWarrantyPeriod(''); setProductionDate(''); setDescription(''); setFiles([]);
      setStock(0); setStatus('Published'); setRegularPrice('');
      setValidated(false);

      setTimeout(() => { navigate('/dashboard/products'); }, 1500);
    } catch (err) {
      if (err.response && err.response.status === 401) { setErrorMessage('Sesi Anda tidak valid...'); logout(); navigate('/dashboard/login', {replace: true});}
      else { setErrorMessage(err.response?.data?.error || 'Gagal menambahkan produk.'); }
      console.error('Add product error:', err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-md-flex justify-content-between align-items-center">
              <div>
                <h2>Add New Product</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/products" className="text-inherit">Products</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Add New Product</li>
                  </ol>
                </nav>
              </div>
              <div><Link to="/dashboard/products" className="btn btn-light">Back to Products</Link></div>
            </div>
          </div>
        </div>

        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
        {categoriesError && <div className="alert alert-warning" role="alert">{categoriesError}</div>}

        <form onSubmit={handleSubmit} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`}>
          <div className="row">
            <div className="col-lg-8 col-12"> {/* Kolom Utama untuk Info Produk & Deskripsi */}
              <div className="card mb-6 card-lg">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5">Product Information</h4>
                  <div className="row">
                    {/* Title */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="productTitleInput">Title <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="Product Title" id="productTitleInput"
                        value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
                      <div className="invalid-feedback">Please enter product title.</div>
                    </div>
                    {/* Product Category Dropdown */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="productCategorySelect">Product Category <span className="text-danger">*</span></label>
                      <select className="form-select" id="productCategorySelect" value={selectedProductCategoryId}
                        onChange={(e) => setSelectedProductCategoryId(e.target.value)} required disabled={loading || loadingCategories}>
                        <option value="">{loadingCategories ? "Loading..." : "Select Category"}</option>
                        {productCategoriesOptions.map(cat => (
                          <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{categoriesError || "Please select a category."}</div>
                    </div>
                    {/* Brand */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="brandInput">Brand</label>
                      <input type="text" className="form-control" placeholder="Brand Name" id="brandInput"
                        value={brand} onChange={(e) => setBrand(e.target.value)} disabled={loading} />
                    </div>
                    {/* Power Source */}
                     <div className="mb-3 col-lg-6">
                        <label className="form-label" htmlFor="powerSourceSelect">Power Source</label>
                        <select className="form-select" id="powerSourceSelect" value={powerSource} onChange={(e) => setPowerSource(e.target.value)} disabled={loading}>
                            <option value="">Select Power Source</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Manual">Manual</option>
                            {/* Tambahkan opsi lain jika perlu */}
                        </select>
                    </div>
                    {/* Warranty Period */}
                    <div className="mb-3 col-lg-6">
                        <label className="form-label" htmlFor="warrantyPeriodSelect">Warranty Period</label>
                        <select className="form-select" id="warrantyPeriodSelect" value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} disabled={loading}>
                            <option value="">Select Warranty</option>
                            <option value="No Warranty">No Warranty</option>
                            <option value="1 Month">1 Month</option>
                            <option value="3 Months">3 Months</option>
                            <option value="6 Months">6 Months</option>
                            <option value="12 Months">12 Months</option>
                            <option value="24 Months">24 Months</option>
                            <option value="36 Months">36 Months</option>
                        </select>
                    </div>
                    {/* Production Date */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="productionDateInput">Production Date</label>
                      <input type="date" className="form-control" id="productionDateInput"
                        value={productionDate} onChange={(e) => setProductionDate(e.target.value)} disabled={loading} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Images Card */}
              <div className="card mb-6 card-lg">
                <div className="card-body p-6">
                  <h4 className="mb-3 h5">Product Images</h4>
                  <div {...getRootProps({ className: `dropzone dz-clickable ${isDragAccept ? 'dz-drag-hover' : ''} ${isDragReject ? 'border-danger' : ''} ${isFocused ? 'border-primary' : ''}` })} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
                    <input {...getInputProps()} />
                    {files.length === 0 ? (
                      <div className="dz-message needsclick py-5">
                        <i className="bi bi-cloud-arrow-up fs-1"></i>
                        <h4 className="mb-1">Drop files here or click to upload.</h4>
                        <span className="text-muted">(Max 5 images, up to 5MB each. JPG, PNG, GIF)</span>
                      </div>
                    ) : null}
                  </div>
                  {files.length > 0 && (
                    <aside className="thumbs-container mt-3 d-flex flex-wrap gap-2">
                      {thumbs}
                    </aside>
                  )}
                </div>
              </div>

              {/* Description Card */}
              <div className="card mb-6 card-lg">
                <div className="card-body p-6" style={{minHeight: '300px'}}>
                  <h4 className="mb-3 h5">Product Description</h4>
                  <ReactQuill theme="snow" value={description} onChange={setDescription} style={{ height: '180px' }} readOnly={loading} />
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-12"> {/* Kolom Kanan untuk Status, Harga, dll. */}
              <div className="card mb-6 card-lg">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5">Status</h4>
                  <div className="mb-3">
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="productStatusRadio" id="statusPublishedProd" value="Published" checked={status === 'Published'} onChange={(e) => setStatus(e.target.value)} disabled={loading} />
                      <label className="form-check-label" htmlFor="statusPublishedProd">Published</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="productStatusRadio" id="statusUnpublishedProd" value="Unpublished" checked={status === 'Unpublished'} onChange={(e) => setStatus(e.target.value)} disabled={loading} />
                      <label className="form-check-label" htmlFor="statusUnpublishedProd">Unpublished</label>
                    </div>
                  </div>

                  <h4 className="mb-3 h5 mt-5">Pricing & Stock</h4>
                   {/* Regular Price */}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="regularPriceInput">Regular Price <span className="text-danger">*</span></label>
                    <input type="number" step="0.01" className="form-control" placeholder="Rp" id="regularPriceInput"
                      value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} required disabled={loading} />
                    <div className="invalid-feedback">Please enter regular price.</div>
                  </div>
                  {/* Stock */}
                  <div className="mb-3">
                    <label className="form-label" htmlFor="productStockInput">Stock <span className="text-danger">*</span></label>
                    <input type="number" className="form-control" placeholder="Quantity" id="productStockInput"
                      value={stock} onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))} required min="0" disabled={loading} />
                     <div className="invalid-feedback">Please enter stock quantity (0 or more).</div>
                  </div>
                </div>
              </div>
              
              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating Product...' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddProduct;