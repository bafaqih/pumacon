import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const EditProduct = () => {
  const { productId: paramProductSKU } = useParams();
  const navigate = useNavigate(); 
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validated, setValidated] = useState(false);

  const [productCategoriesOptions, setProductCategoriesOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [productSKUDisplay, setProductSKUDisplay] = useState('');
  const [title, setTitle] = useState('');
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [powerSource, setPowerSource] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(0);
  const [status, setStatus] = useState('Published');
  const [capitalPrice, setCapitalPrice] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  
  const [files, setFiles] = useState([]); 
  const [existingImages, setExistingImages] = useState([]); 

  const defaultProductImage = '/assets/images/products/default-image.jpg';
  const backendAssetBaseUrl = 'http://localhost:8080';

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return defaultProductImage;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    return `${backendAssetBaseUrl}/${cleanPath}`;
  }, [backendAssetBaseUrl, defaultProductImage]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (e) { console.error("Error formatting date:", e); return ''; }
  };

  useEffect(() => {
    const fetchProductCategories = async () => {
      if (!token) {
        setCategoriesError("Authentication is required to load product categories.");
        setLoadingCategories(false);
        return;
      }
      setLoadingCategories(true); setCategoriesError('');
      try {
        const response = await api.get('/admin/product-categories/list-active', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductCategoriesOptions(response.data.categories || []);
      } catch (err) {
        console.error("Error fetching product categories:", err);
        if (err.response && err.response.status === 401) {
          setCategoriesError("Your session is invalid. Please login again.");
          logout(); navigate('/dashboard/login', {replace: true});
        } else {
          setCategoriesError(err.response?.data?.error || "Failed to load product categories.");
        }
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchProductCategories();
  }, [token, navigate, logout]);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!paramProductSKU || !token) {
        setErrorMessage("Product SKU is invalid or you are not authenticated.");
        setLoadingData(false);
        if (!token) navigate('/dashboard/login', { replace: true });
        return;
      }
      setLoadingData(true); setErrorMessage('');
      try {
        const response = await api.get(`/admin/products/${paramProductSKU}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prod = response.data.product || response.data;
        if (prod) {
          setProductSKUDisplay(prod.ProductSKU);
          setTitle(prod.Title || '');
          setSelectedProductCategoryId(prod.ProductCategoryID || '');
          setBrand(prod.Brand || '');
          setPowerSource(prod.PowerSource || '');
          setWarrantyPeriod(prod.WarrantyPeriod || '');
          setProductionDate(formatDateForInput(prod.ProductionDate));
          setDescription(prod.Descriptions || '');
          setStock(prod.Stock || 0);
          setStatus(prod.Status || 'Published');
          setCapitalPrice(prod.CapitalPrice !== undefined ? String(prod.CapitalPrice) : '');
          setRegularPrice(prod.RegularPrice !== undefined ? String(prod.RegularPrice) : '');
          setExistingImages(Array.isArray(prod.Images) ? prod.Images : []);
        } else {
          setErrorMessage(`Product with SKU ${paramProductSKU} not found.`);
          setProductSKUDisplay(paramProductSKU);
        }
      } catch (err) {
        console.error("Fetch product data error:", err);
        if (err.response && err.response.status === 401) {
          setErrorMessage('Your session is invalid. Please login again.');
          logout(); navigate('/dashboard/login', {replace: true});
        } else {
          setErrorMessage(err.response?.data?.error || `Failed to fetch product data for SKU ${paramProductSKU}.`);
        }
      } finally {
        setLoadingData(false);
      }
    };
    if (paramProductSKU) {
        fetchProductData();
    }
  }, [paramProductSKU, token, navigate, logout]); 

  const onDrop = useCallback(acceptedFiles => {
    const newFilesWithPreview = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prevFiles => [...prevFiles, ...newFilesWithPreview].slice(0, 5)); 
  }, []);

  const { getRootProps, getInputProps, isDragAccept, isDragReject, isFocused } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
    maxSize: 5 * 1024 * 1024,
  });

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  const removeNewFile = (fileNameToRemove, e) => {
    e.stopPropagation();
    setFiles(currentFiles => currentFiles.filter(file => file.name !== fileNameToRemove));
  };
  
  const removeExistingImage = async (imageId, imagePath) => {
    if (!window.confirm(`Are you sure you want to delete this existing image? This action is permanent.`)) return;
    
    setLoading(true);
    try {
      await api.delete(`/admin/products/${paramProductSKU}/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExistingImages(prevImages => prevImages.filter(img => img.ID !== imageId));
      setSuccessMessage("Image deleted successfully.")
    } catch (err) {
      console.error("Error deleting existing image:", err);
      setErrorMessage(err.response?.data?.error || "Failed to delete existing image.");
    } finally {
      setLoading(false);
    }
  };


  const newFileThumbs = files.map(file => (
    <div className="thumb" key={file.name} style={{ display: 'inline-flex', borderRadius: 2, border: '1px solid #eaeaea', marginBottom: 8, marginRight: 8, width: 100, height: 100, padding: 4, boxSizing: 'border-box', position: 'relative' }}>
        <img src={file.preview} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} alt={file.name} />
        <button type="button" className="btn btn-sm btn-danger p-0 lh-1" onClick={(e) => removeNewFile(file.name, e)} style={{ position: 'absolute', top: 2, right: 2, zIndex:1, width: '20px', height: '20px' }} title="Remove new image">
            <i className="bi bi-x"></i>
        </button>
    </div>
  ));

  const existingImagesThumbs = existingImages.map((img, index) => (
    <div className="thumb" key={img.ID || `existing-${index}`} style={{ display: 'inline-flex', borderRadius: 2, border: '1px solid #eaeaea', marginBottom: 8, marginRight: 8, width: 100, height: 100, padding: 4, boxSizing: 'border-box', position: 'relative' }}>
        <img src={getImageUrl(img.Image)} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} alt={`Existing ${index + 1}`} />
        <button 
            type="button" 
            className="btn btn-sm btn-warning p-0 lh-1" 
            onClick={() => removeExistingImage(img.ID, img.Image)} 
            style={{ position: 'absolute', top: 2, right: 2, zIndex:1, width: '20px', height: '20px' }}
            title="Delete existing image"
            disabled={loading}
        >
            <i className="bi bi-trash"></i>
        </button>
    </div>
  ));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage(''); setErrorMessage('');
    setValidated(true);

    const form = event.currentTarget;
    if (form.checkValidity() === false || selectedProductCategoryId === "") {
      event.stopPropagation();
      if (selectedProductCategoryId === "") setErrorMessage("Product category is required.");
      setLoading(false); return;
    }
    if (!token) {
        setErrorMessage("Authentication required."); 
        logout(); navigate('/dashboard/login', {replace: true}); 
        setLoading(false); return;
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
      capital_price: parseFloat(capitalPrice) || 0,
      regular_price: parseFloat(regularPrice) || 0,
    };
    formDataPayload.append('jsonData', JSON.stringify(productDataForUpdate));
    files.forEach((file) => { formDataPayload.append(`imageFiles`, file); });

    try {
      const response = await api.put(`/admin/products/${paramProductSKU}`, formDataPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage(response.data.message || 'Product updated successfully!');
      setValidated(false);
      setFiles([]);
      if (response.data.product) { 
        const updatedProd = response.data.product;
        setExistingImages(Array.isArray(updatedProd.Images) ? updatedProd.Images : []);
      }
    } catch (err) {
      setSuccessMessage('');
      if (err.response && err.response.status === 401) { 
        setErrorMessage('Your session is invalid. Please login again.');
        logout(); navigate('/dashboard/login', {replace: true});
      } else { 
        setErrorMessage(err.response?.data?.error || 'Failed to update product.');
      }
      console.error('Update product error:', err.response || err.message || err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingData && !productSKUDisplay) {
    return <main className="main-content-wrapper"><div className="container text-center p-5">Loading product data...</div></main>;
  }

  if (errorMessage && !productSKUDisplay && !loadingData) {
      return (
          <main className="main-content-wrapper">
              <div className="container">
                  <div className="alert alert-danger mt-3" role="alert">{errorMessage}</div>
                  <Link to="/dashboard/products" className="btn btn-secondary">Back to Products</Link>
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
                <h2>Edit Product <span className="text-muted fs-5">({productSKUDisplay || 'Loading SKU...'})</span></h2>
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
        {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
        {categoriesError && <div className="alert alert-warning" role="alert">{categoriesError}</div>}

        <form onSubmit={handleSubmit} noValidate className={`needs-validation ${validated ? 'was-validated' : ''}`}>
          <div className="row">
            <div className="col-lg-8 col-12">
              <div className="card mb-6 card-lg">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5">Product Information</h4>
                  <div className="row g-3"> 
                    <div className="mb-3 col-lg-6">
                        <label className="form-label" htmlFor="productSKUDisplayInput">Product SKU</label>
                        <input type="text" className="form-control" id="productSKUDisplayInput" value={productSKUDisplay} readOnly disabled style={{backgroundColor: '#e9ecef'}}/>
                    </div>
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="productTitleInput">Title <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" placeholder="Product Title" id="productTitleInput"
                        value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loadingData || loading} />
                      <div className="invalid-feedback">Please enter product title.</div>
                    </div>
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="productCategorySelect">Product Category <span className="text-danger">*</span></label>
                      <select className="form-select" id="productCategorySelect" value={selectedProductCategoryId}
                        onChange={(e) => setSelectedProductCategoryId(e.target.value)} required disabled={loadingData || loadingCategories || loading}>
                        <option value="">{loadingCategories ? "Loading..." : "Select Category"}</option>
                        {productCategoriesOptions.map(cat => (
                          <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{categoriesError || "Please select a category."}</div>
                    </div>
                    <div className="mb-3 col-lg-6"><label className="form-label" htmlFor="brandInput">Brand</label><input type="text" className="form-control" placeholder="Brand Name" id="brandInput" value={brand} onChange={(e) => setBrand(e.target.value)} disabled={loadingData||loading} /></div>
                    <div className="mb-3 col-lg-6"><label className="form-label" htmlFor="powerSourceSelect">Power Source</label><select className="form-select" id="powerSourceSelect" value={powerSource} onChange={(e) => setPowerSource(e.target.value)} disabled={loadingData||loading}><option value="">Select Power Source</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option><option value="Battery">Battery</option><option value="Manual">Manual</option></select></div>
                    <div className="mb-3 col-lg-6"><label className="form-label" htmlFor="warrantyPeriodSelect">Warranty Period</label><select className="form-select" id="warrantyPeriodSelect" value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} disabled={loadingData||loading}><option value="">Select Warranty</option><option value="No Warranty">No Warranty</option><option value="1 Month">1 Month</option><option value="3 Months">3 Months</option><option value="6 Months">6 Months</option><option value="12 Months">12 Months</option><option value="24 Months">24 Months</option><option value="36 Months">36 Months</option></select></div>
                    <div className="mb-3 col-lg-6"><label className="form-label" htmlFor="productionDateInput">Production Date</label><input type="date" className="form-control" id="productionDateInput" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} disabled={loadingData||loading} /></div>
                  </div>
                </div>
              </div>

              <div className="card mb-6 card-lg">
                <div className="card-body p-6">
                  <h4 className="mb-3 h5">Product Images</h4>
                  {existingImages.length > 0 && (
                    <>
                        <h6 className="mb-2 h5">Existing Images</h6>
                        <aside className="thumbs-container mb-3 d-flex flex-wrap gap-2">
                            {existingImagesThumbs}
                        </aside>
                    </>
                  )}
                  <h6 className="mb-2 h5 mt-4">Add/Replace Images</h6>
                  <div {...getRootProps({ className: `dropzone mt-2 border-dashed rounded-2 min-h-0 ${isDragAccept ? 'dz-drag-hover' : ''} ${isDragReject ? 'border-danger' : ''} ${isFocused ? 'border-primary' : ''}` })} style={{ border: '2px dashed #ccc', padding: '20px', textAlign: 'center' }}>
                    <input {...getInputProps()} />
                    <div className="dz-message needsclick py-5">
                        <i className="bi bi-cloud-arrow-up fs-1"></i>
                        <h4 className="mb-1">Drop files here or click to upload new images.</h4>
                        <span className="text-muted">(New images will replace all existing ones. Max 5, up to 5MB each.)</span>
                    </div>
                  </div>
                  {files.length > 0 && (
                    <aside className="thumbs-container mt-3 d-flex flex-wrap gap-2">
                      {newFileThumbs}
                    </aside>
                  )}
                </div>
              </div>

              <div className="card mb-6 card-lg">
                <div className="card-body p-6" style={{minHeight: '300px'}}>
                  <h4 className="mb-3 h5">Product Description</h4>
                  <ReactQuill theme="snow" value={description} onChange={setDescription} style={{ height: '180px' }} readOnly={loadingData || loading} />
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-12">
              <div className="card mb-6 card-lg">
                <div className="card-body p-6">
                  <h4 className="mb-4 h5">Status</h4>
                  <div className="mb-3">
                    <div className="form-check form-check-inline"><input className="form-check-input" type="radio" name="productStatusRadioEdit" id="statusPublishedProdEdit" value="Published" checked={status === 'Published'} onChange={(e) => setStatus(e.target.value)} disabled={loadingData||loading} /><label className="form-check-label" htmlFor="statusPublishedProdEdit">Published</label></div>
                    <div className="form-check form-check-inline"><input className="form-check-input" type="radio" name="productStatusRadioEdit" id="statusUnpublishedProdEdit" value="Unpublished" checked={status === 'Unpublished'} onChange={(e) => setStatus(e.target.value)} disabled={loadingData||loading} /><label className="form-check-label" htmlFor="statusUnpublishedProdEdit">Unpublished</label></div>
                  </div>
                  <h4 className="mb-3 h5 mt-5">Pricing & Stock</h4>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="capitalPriceInputEdit">Capital Price <span className="text-danger">*</span></label>
                    <input type="number" step="0.01" className="form-control" placeholder="Rp" id="capitalPriceInputEdit"
                      value={capitalPrice} onChange={(e) => setCapitalPrice(e.target.value)} required disabled={loadingData || loading} />
                    <div className="invalid-feedback">Please enter capital price.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="regularPriceInputEdit">Regular Price <span className="text-danger">*</span></label>
                    <input type="number" step="0.01" className="form-control" placeholder="Rp" id="regularPriceInputEdit"
                      value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} required disabled={loadingData || loading} />
                    <div className="invalid-feedback">Please enter regular price.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="productStockInputEdit">Stock <span className="text-danger">*</span></label>
                    <input type="number" className="form-control" placeholder="Quantity" id="productStockInputEdit"
                      value={stock} onChange={(e) => setStock(Math.max(0, parseInt(e.target.value, 10) || 0))} required min="0" disabled={loadingData || loading} />
                     <div className="invalid-feedback">Please enter stock quantity (0 or more).</div>
                  </div>
                </div>
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary" disabled={loadingData || loading}>
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