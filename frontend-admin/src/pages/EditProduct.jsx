// src/pages/EditProduct.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new'; // Asumsi 'react-quill'
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext'; // Sesuaikan path
import api from '../services/api'; // Sesuaikan path

const EditProduct = () => {
  const { productId: paramProductSKU } = useParams(); // Ambil productSKU dari URL (sesuaikan nama param jika beda)
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // State untuk loading dan pesan
  const [loading, setLoading] = useState(false);         // Untuk proses submit
  const [loadingData, setLoadingData] = useState(true); // Untuk fetch data awal produk
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validated, setValidated] = useState(false);

  // State untuk dropdown kategori produk
  const [productCategoriesOptions, setProductCategoriesOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // State untuk form fields produk
  const [productSKUDisplay, setProductSKUDisplay] = useState(''); // Untuk menampilkan SKU (read-only)
  const [title, setTitle] = useState('');
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [powerSource, setPowerSource] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [productionDate, setProductionDate] = useState(''); // String YYYY-MM-DD
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(0);
  const [status, setStatus] = useState('Published'); // Published atau Unpublished
  const [currentImagePath, setCurrentImagePath] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('/assets/images/docs/placeholder-img.jpg');
  const [avatarFile, setAvatarFile] = useState(null);
  const [files, setFiles] = useState([]); // Untuk file baru yang akan diupload
  const [existingImages, setExistingImages] = useState([]); // Untuk gambar yang sudah ada

  // Fungsi untuk format tanggal YYYY-MM-DD untuk input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (e) { return ''; }
  };
  
  const backendAssetBaseUrl = 'http://localhost:8080'; // Sesuaikan
  const defaultProductImage = '/assets/images/products/default-product.png';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultProductImage;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${backendAssetBaseUrl}/${cleanPath}`;
  };


  // 1. useEffect untuk mengambil daftar kategori produk aktif
  useEffect(() => {
    const fetchProductCategories = async () => {
      if (!token) { setLoadingCategories(false); return; }
      setLoadingCategories(true); setCategoriesError('');
      try {
        const response = await api.get('/admin/product-categories/list-active', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductCategoriesOptions(response.data.categories || []);
      } catch (err) {
        if (err.response && err.response.status === 401) { logout(); navigate('/dashboard/login', {replace: true});}
        setCategoriesError(err.response?.data?.error || "Gagal memuat kategori.");
      } finally { setLoadingCategories(false); }
    };
    fetchProductCategories();
  }, [token, navigate, logout]);

  // 2. useEffect untuk mengambil data produk yang akan diedit
  useEffect(() => {
    const fetchProductData = async () => {
      if (!paramProductSKU || !token) {
        setErrorMessage("SKU produk tidak valid atau Anda tidak terautentikasi.");
        setLoadingData(false);
        if (!token) navigate('/dashboard/login', { replace: true });
        return;
      }
      setLoadingData(true); setErrorMessage('');
      try {
        // Endpoint ini akan kita buat: GET /admin/products/:productSKU
        const response = await api.get(`/admin/products/${paramProductSKU}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prod = response.data.product || response.data; // Sesuaikan dengan respons API Anda
        if (prod) {
          setProductSKUDisplay(prod.ProductSKU);
          setTitle(prod.Title || '');
          setSelectedProductCategoryId(prod.ProductCategoryID || ''); // Backend harus kirim ProductCategoryID
          setBrand(prod.Brand || '');
          setPowerSource(prod.PowerSource || '');
          setWarrantyPeriod(prod.WarrantyPeriod || '');
          setProductionDate(formatDateForInput(prod.ProductionDate));
          setDescription(prod.Descriptions || ''); // Pastikan nama field 'Descriptions' dari backend
          setStock(prod.Stock || 0);
          setStatus(prod.Status || 'Published');
          setRegularPrice(prod.RegularPrice !== undefined ? String(prod.RegularPrice) : '');
          setExistingImages(prod.Images || []); // Simpan array gambar yang ada
        } else {
          setErrorMessage(`Produk dengan SKU ${paramProductSKU} tidak ditemukan.`);
        }
      } catch (err) {
        if (err.response && err.response.status === 401) { setErrorMessage('Sesi tidak valid.'); logout(); navigate('/dashboard/login', {replace: true});}
        else { setErrorMessage(err.response?.data?.error || `Gagal mengambil data produk ${paramProductSKU}.`); }
        console.error("Fetch product data error:", err);
      } finally { setLoadingData(false); }
    };
    if (paramProductSKU) {
        fetchProductData();
    }
  }, [paramProductSKU, token, navigate, logout]);


  // Fungsi Dropzone dan manajemen file (mirip AddProduct, tapi mungkin perlu logika untuk existingImages)
  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    // Untuk edit, mungkin Anda ingin mengganti semua gambar atau menambahkannya.
    // Untuk contoh ini, kita asumsikan file baru akan menggantikan yang lama jika ada,
    // atau backend akan menangani penambahan/penggantian.
    setFiles(prevFiles => [...prevFiles, ...newFiles].slice(0, 5)); // Batasi jumlah file baru
  }, []);

  const { getRootProps, getInputProps, isDragAccept, isDragReject, isFocused } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
    maxSize: 5 * 1024 * 1024,
  });

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  const removeNewFile = (fileName, e) => {
    e.stopPropagation();
    setFiles(files.filter(file => file.name !== fileName));
  };

  // Fungsi untuk menghapus gambar yang sudah ada (memerlukan API call atau logika khusus)
  // const removeExistingImage = (imagePath, e) => {
  //   e.stopPropagation();
  //   // TODO: Implementasi logika untuk menandai gambar ini agar dihapus di backend
  //   // atau langsung panggil API delete image jika ada.
  //   // Untuk sekarang, kita hanya akan menghapusnya dari state `existingImages` di UI.
  //   setExistingImages(existingImages.filter(img => img.Image !== imagePath));
  //   console.log("Request to remove existing image:", imagePath);
  // };

  const newFileThumbs = files.map(file => (
    <div className="thumb" key={file.name} style={{ display: 'inline-flex', borderRadius: 2, border: '1px solid #eaeaea', marginBottom: 8, marginRight: 8, width: 100, height: 100, padding: 4, boxSizing: 'border-box', position: 'relative' }}>
        <img src={file.preview} style={{ display: 'block', width: 'auto', height: '100%' }} alt={file.name} />
        <button type="button" className="btn btn-sm btn-danger" onClick={(e) => removeNewFile(file.name, e)} style={{ position: 'absolute', top: 0, right: 0, zIndex:1 }}>X</button>
    </div>
  ));

  const existingImagesThumbs = existingImages.map((img, index) => (
    <div className="thumb" key={img.ID || `existing-${index}`} style={{ display: 'inline-flex', borderRadius: 2, border: '1px solid #eaeaea', marginBottom: 8, marginRight: 8, width: 100, height: 100, padding: 4, boxSizing: 'border-box', position: 'relative' }}>
        <img src={getImageUrl(img.Image)} style={{ display: 'block', width: 'auto', height: '100%' }} alt={`Existing ${index}`} />
        {/* <button type="button" className="btn btn-sm btn-warning" onClick={(e) => removeExistingImage(img.Image, e)} style={{ position: 'absolute', top: 0, right: 0, zIndex:1 }}>Remove</button> */}
        {/* Tombol remove existing image perlu logika backend yang kompleks */}
    </div>
  ));


  // Handle Submit Form untuk Update
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage(''); // Dibersihkan di awal
    setErrorMessage('');   // Dibersihkan di awal
    setValidated(true);

    const form = event.currentTarget;
    if (form.checkValidity() === false || selectedProductCategoryId === "") {
      event.stopPropagation();
      if (selectedProductCategoryId === "") setErrorMessage("Kategori produk wajib dipilih.");
      setLoading(false);
      return;
    }

    if (!token) { /* ... (penanganan token) ... */ 
        setErrorMessage("Autentikasi dibutuhkan..."); logout(); navigate('/dashboard/login', {replace: true}); setLoading(false); return;
    }

    const formDataPayload = new FormData();

    const productDataForUpdate = {
      title: title,
      brand: brand,
      product_category_id: selectedProductCategoryId,
      power_source: powerSource,
      warranty_period: warrantyPeriod,
      production_date: productionDate,
      descriptions: description,
      stock: parseInt(stock, 10) || 0,
      status: status,
      regular_price: parseFloat(regularPrice) || 0,
      // Untuk gambar, backend perlu logika: jika imageFiles dikirim, ganti/tambah gambar.
      // Jika tidak, jangan ubah gambar yang ada, atau jika ada instruksi khusus untuk menghapus.
      // Kita tidak mengirim 'currentImagePath' di jsonData, backend harus tahu gambar lama jika perlu menghapusnya.
    };
    formDataPayload.append('jsonData', JSON.stringify(productDataForUpdate));

    // Tambahkan file gambar baru jika ada
    files.forEach((file) => {
        formDataPayload.append(`imageFiles`, file); // Backend akan menerima array 'imageFiles'
    });

    try {
      // Endpoint ini akan kita buat: PUT /admin/products/:productSKU
      const response = await api.put(`/admin/products/${paramProductSKU}`, formDataPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage(response.data.message || 'Produk berhasil diupdate!');
      setValidated(false);
      setFiles([]); // Kosongkan file baru setelah upload
      // Muat ulang data produk yang diupdate untuk menampilkan gambar baru jika ada
      if (response.data.product) {
        const updatedProduct = response.data.product;
        setExistingImages(Array.isArray(updatedProduct.Images) ? updatedProduct.Images : []); // Pastikan Images adalah array

        if (Array.isArray(updatedProduct.Images) && updatedProduct.Images.length > 0) {
          setAvatarPreview(getImageUrl(updatedProduct.Images[0].Image));
          setCurrentImagePath(updatedProduct.Images[0].Image);
        } else {
          if (!avatarFile) { 
            setAvatarPreview(getImageUrl(currentImagePath)); 
          } else { 
            setAvatarPreview(defaultProductImage);
            setCurrentImagePath('');
          }
        }
      } else {
         if (!avatarFile) {
            setAvatarPreview(getImageUrl(currentImagePath));
         } else {
            setAvatarPreview(defaultProductImage); 
            setCurrentImagePath('');
         }
      }
      setAvatarFile(null);
      
      setTimeout(() => { navigate('/dashboard/products'); }, 1500);
    } catch (err) {
      setSuccessMessage(''); 

      if (err.response && err.response.status === 401) {
        setErrorMessage('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
        logout();
        navigate('/dashboard/login', {replace: true});
      } else {
        setErrorMessage(err.response?.data?.error || 'Gagal mengupdate produk. Terjadi kesalahan JavaScript atau API.');
      }
      console.error('Update product error:', err.response || err.message || err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <main className="main-content-wrapper"><div className="container text-center p-5">Loading product data...</div></main>;
  }

  if (errorMessage && !productSKUDisplay) { // Error saat fetch data awal dan SKU belum ada
      return (
          <main className="main-content-wrapper">
              <div className="container">
                  <div className="alert alert-danger mt-3" role="alert">{errorMessage}</div>
                  <Link to="/dashboard/products" className="btn btn-secondary">Back to Products</Link>
              </div>
          </main>
      );
  }

    const handleAvatarChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Pastikan ini ada dan benar
    } else {
      setAvatarFile(null);
      setAvatarPreview(getImageUrl(currentImagePath));
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
                <h2>Edit Product <span className="text-muted fs-5">({productSKUDisplay || '...'})</span></h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/products" className="text-inherit">Products</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Edit Product</li>
                  </ol>
                </nav>
              </div>
              <div><Link to="/dashboard/products" className="btn btn-light">Back to Products</Link></div>
            </div>
          </div>
        </div>

        {successMessage && <div className="alert alert-success" role="alert">{successMessage}</div>}
        {errorMessage && !loadingData && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
        {categoriesError && <div className="alert alert-warning" role="alert">{categoriesError}</div>}

        <form onSubmit={handleSubmit} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`}>
          <div className="row">
            <div className="col-lg-8 col-12"> {/* Kolom Utama */}
              {/* Product Information Card */}
              <div className="card mb-6 card-lg">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5">Product Information</h4>
                  <div className="row">
                    {/* Product SKU (Read-Only) */}
                    <div className="mb-3 col-lg-6">
                        <label className="form-label" htmlFor="productSKUDisplayInput">Product SKU</label>
                        <input type="text" className="form-control" id="productSKUDisplayInput" value={productSKUDisplay} readOnly disabled style={{backgroundColor: '#e9ecef'}}/>
                    </div>
                    {/* Title */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="productTitleInput">Title <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="Product Title" id="productTitleInput"
                        value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading || loadingData} />
                      <div className="invalid-feedback">Please enter product title.</div>
                    </div>
                    {/* Product Category Dropdown */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="productCategorySelect">Product Category <span className="text-danger">*</span></label>
                      <select className="form-select" id="productCategorySelect" value={selectedProductCategoryId}
                        onChange={(e) => setSelectedProductCategoryId(e.target.value)} required disabled={loading || loadingData || loadingCategories}>
                        <option value="">{loadingCategories ? "Loading..." : "Select Category"}</option>
                        {productCategoriesOptions.map(cat => (
                          <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{categoriesError || "Please select a category."}</div>
                    </div>
                    {/* Brand, Power Source, Warranty, Production Date (sama seperti AddProduct, tambahkan disabled={loading || loadingData}) */}
                    <div className="mb-3 col-lg-6"><label className="form-label" htmlFor="brandInput">Brand</label><input type="text" className="form-control" placeholder="Brand Name" id="brandInput" value={brand} onChange={(e) => setBrand(e.target.value)} disabled={loading||loadingData} /></div>
                    <div className="mb-3 col-lg-6"><label className="form-label" htmlFor="powerSourceSelect">Power Source</label><select className="form-select" id="powerSourceSelect" value={powerSource} onChange={(e) => setPowerSource(e.target.value)} disabled={loading||loadingData}><option value="">Select Power Source</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option><option value="Battery">Battery</option><option value="Manual">Manual</option></select></div>
                    <div className="mb-3 col-lg-6"><label className="form-label" htmlFor="warrantyPeriodSelect">Warranty Period</label><select className="form-select" id="warrantyPeriodSelect" value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} disabled={loading||loadingData}><option value="">Select Warranty</option><option value="No Warranty">No Warranty</option><option value="1 Month">1 Month</option><option value="3 Months">3 Months</option><option value="6 Months">6 Months</option><option value="12 Months">12 Months</option><option value="24 Months">24 Months</option><option value="36 Months">36 Months</option></select></div>
                    <div className="mb-3 col-lg-6"><label className="form-label" htmlFor="productionDateInput">Production Date</label><input type="date" className="form-control" id="productionDateInput" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} disabled={loading||loadingData} /></div>
                  </div>
                </div>
              </div>

              {/* Product Images Card */}
              <div className="card mb-6 card-lg">
                <div className="card-body p-6">
                  <h4 className="mb-3 h5">Product Images</h4>
                  <h6 className="mb-2 h5">Existing Images</h6>
                  {existingImages.length > 0 ? (
                    <aside className="thumbs-container mb-3 d-flex flex-wrap gap-2">
                        {existingImagesThumbs}
                    </aside>
                  ) : <p className="text-muted">No existing images.</p>}
                  
                  <h6 className="mb-2 h5 mt-4">Add New Images</h6>
                  <div {...getRootProps({ className: `dropzone mt-2 border-dashed rounded-2 min-h-0 ${isDragAccept ? 'dz-drag-hover' : ''} ${isDragReject ? 'border-danger' : ''} ${isFocused ? 'border-primary' : ''}` })} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
                    <input {...getInputProps()} />
                    <div className="dz-message needsclick py-5">
                        <i className="bi bi-cloud-arrow-up fs-1"></i>
                        <h4 className="mb-1">Drop files here or click to upload new images.</h4>
                        <span className="text-muted">(Max 5 new images, up to 5MB each. JPG, PNG, GIF)</span>
                    </div>
                  </div>
                  {files.length > 0 && (
                    <aside className="thumbs-container mt-3 d-flex flex-wrap gap-2">
                      {newFileThumbs}
                    </aside>
                  )}
                </div>
              </div>

              {/* Description Card */}
              <div className="card mb-6 card-lg">
                <div className="card-body p-6" style={{minHeight: '300px'}}>
                  <h4 className="mb-3 h5">Product Description</h4>
                  <ReactQuill theme="snow" value={description} onChange={setDescription} style={{ height: '180px' }} readOnly={loading || loadingData} />
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-12"> {/* Kolom Kanan */}
              <div className="card mb-6 card-lg">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5">Status</h4>
                  <div className="mb-3">
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="productStatusRadioEdit" id="statusPublishedProdEdit" value="Published" checked={status === 'Published'} onChange={(e) => setStatus(e.target.value)} disabled={loading||loadingData} />
                      <label className="form-check-label" htmlFor="statusPublishedProdEdit">Published</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="productStatusRadioEdit" id="statusUnpublishedProdEdit" value="Unpublished" checked={status === 'Unpublished'} onChange={(e) => setStatus(e.target.value)} disabled={loading||loadingData} />
                      <label className="form-check-label" htmlFor="statusUnpublishedProdEdit">Unpublished</label>
                    </div>
                  </div>

                  <h4 className="mb-3 h5 mt-5">Pricing & Stock</h4>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="regularPriceInputEdit">Regular Price <span className="text-danger">*</span></label>
                    <input type="number" step="0.01" className="form-control" placeholder="Rp" id="regularPriceInputEdit"
                      value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} required disabled={loading||loadingData} />
                    <div className="invalid-feedback">Please enter regular price.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="productStockInputEdit">Stock <span className="text-danger">*</span></label>
                    <input type="number" className="form-control" placeholder="Quantity" id="productStockInputEdit"
                      value={stock} onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))} required min="0" disabled={loading||loadingData} />
                     <div className="invalid-feedback">Please enter stock quantity (0 or more).</div>
                  </div>
                </div>
              </div>
              
              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={loading || loadingData}>
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditProduct;