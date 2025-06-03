// src/pages/AddProductCategories.jsx

import React, { useState, useEffect } from 'react'; // useEffect mungkin tidak lagi diperlukan jika tidak ada inisialisasi khusus
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new'; // Pastikan ini benar, bukan 'react-quill-new'
// import 'react-quill/dist/quill.snow.css'; // Panggil jika belum di index.html atau main.jsx

const EditNewsCategories = () => {
  const navigate = useNavigate();

  // State untuk form fields
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState(''); // Menggantikan slug
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('published'); // Default ke 'published'

  // State dan handler untuk ikon kategori dihapus karena bagian image dihapus
  // const [categoryIcon, setCategoryIcon] = useState(null);
  // const [categoryIconPreview, setCategoryIconPreview] = useState('/assets/images/icons/bakery.svg');
  // const handleIconChange = ... (dihapus)
  // useEffect untuk categoryIconPreview cleanup ... (dihapus)


  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    // Validasi sederhana Bootstrap
    if (form.checkValidity() === false) {
      event.stopPropagation();
      form.classList.add('was-validated');
      return;
    }
    form.classList.add('was-validated');

    // Data yang akan dikirim (tanpa field yang dihapus)
    const categoryData = {
      categoryName,
      categoryId, // Menggunakan categoryId (sebelumnya slug)
      description,
      status, // Sekarang 'published' atau 'unpublished'
    };

    console.log('Form submitted (Category):', categoryData);
    alert(`Category ${categoryName} created! (Simulated)`);
    // Logika untuk mengirim categoryData ke backend
    // navigate('/dashboard/categories'); // Arahkan ke daftar kategori setelah berhasil
  };

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-md-flex justify-content-between align-items-center">
              <div>
                <h2>Edit Category</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/news" className="text-inherit">News</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/news/categories" className="text-inherit">News Categories</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Edit Category</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/news/categories" className="btn btn-light">Back to Categories</Link>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} noValidate className="needs-validation">
          <div className="row">
            <div className="col-lg-12 col-12">
              <div className="card mb-6 shadow border-0">
                <div className="card-body p-6">
                  {/* Bagian Category Image Dihapus */}
                  
                  <h4 className="mb-4 h5 mt-0">Category Information</h4> {/* mt-5 dihapus karena tidak ada section image di atasnya lagi */}
                  <div className="row">
                    {/* Category Name */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="categoryNameInput">Category Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Category Name" 
                        id="categoryNameInput" 
                        value={categoryName} 
                        onChange={(e) => setCategoryName(e.target.value)} 
                        required 
                      />
                      <div className="invalid-feedback">Please enter category name.</div>
                    </div>
                    
                    {/* ID Category (Menggantikan Slug) */}
                    <div className="mb-3 col-lg-6">
                      <label className="form-label" htmlFor="categoryIdInput">Category ID</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Enter Category ID" 
                        id="categoryIdInput" 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)} 
                        required 
                      />
                      <div className="invalid-feedback">Please enter category ID.</div>
                    </div>

                    {/* Parent Category Dihapus */}
                    {/* Date Dihapus */}
                    
                    {/* Descriptions */}
                    <div className="mb-3 col-lg-12">
                      <label className="form-label">Descriptions</label>
                       <ReactQuill
                        theme="snow"
                        value={description}
                        onChange={setDescription}
                        style={{ height: '150px', marginBottom: '40px' }}
                        placeholder="Write category description here..."
                      />
                       {/* <div className="invalid-feedback">Please enter description.</div>  Quill perlu validasi kustom */}
                    </div>

                    {/* Status */}
                    <div className="mb-3 col-lg-12">
                      <label className="form-label" id="categoryStatusLabel">Status</label><br />
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="categoryStatusRadio" // Nama radio grup
                            id="statusPublished" // ID unik
                            value="published" // Value diubah
                            checked={status === 'published'} 
                            onChange={(e) => setStatus(e.target.value)} 
                        />
                        <label className="form-check-label" htmlFor="statusPublished">Published</label> {/* Label diubah */}
                      </div>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="categoryStatusRadio" 
                            id="statusUnpublished" // ID unik
                            value="unpublished" // Value diubah
                            checked={status === 'unpublished'} 
                            onChange={(e) => setStatus(e.target.value)}
                        />
                        <label className="form-check-label" htmlFor="statusUnpublished">Unpublished</label> {/* Label diubah */}
                      </div>
                    </div>

                    {/* Meta Data Dihapus */}
                    
                    {/* Tombol Aksi */}
                    <div className="col-lg-12 mt-4"> {/* mt-5 diubah ke mt-4 */}
                      <button type="submit" className="btn btn-primary">Save Change</button>
                      {/* Tombol Save as Draft Dihapus */}
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

export default EditNewsCategories;