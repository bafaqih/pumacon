import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import { useAuth } from '../contexts/AuthContext'; 
import api from '../services/api'; 
import { Alert } from 'react-bootstrap';

const AddNewsCategories = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Published');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setValidated(true);

    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const categoryData = {
      category_name: categoryName,
      description: description,
      status: status,
    };

    try {
      const response = await api.post('/admin/news-categories', categoryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccessMessage(response.data.message || "News category added successfully!");
      setCategoryName('');
      setDescription('');
      setStatus('Published');
      setValidated(false);
      setTimeout(() => {
        navigate('/dashboard/news/categories');
      }, 1500);

    } catch (err) {
      console.error("Error adding news category:", err.response || err);
      const errorMsg = err.response?.data?.error || "Failed to add news category. Please try again.";
      setErrorMessage(errorMsg);
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/dashboard/login', { replace: true });
      }
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
                <h2>Add New News Category</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/news/categories" className="text-inherit">News Categories</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Add New Category</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/news/categories" className="btn btn-light">Back to Categories</Link>
              </div>
            </div>
          </div>
        </div>

        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

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
                      <div className="invalid-feedback">Please enter a category name.</div>
                    </div>
                    <div className="mb-3 col-lg-12">
                      <label className="form-label">Description</label>
                        <ReactQuill
                          theme="snow"
                          value={description}
                          onChange={setDescription}
                          style={{ height: '150px', marginBottom: '40px' }}
                          placeholder="Write category description here..."
                          readOnly={loading}
                        />
                    </div>
                    <div className="mb-3 col-lg-12">
                      <label className="form-label" id="categoryStatusLabel">Status</label><br />
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="newsCategoryStatusRadio"
                            id="statusPublished"
                            value="Published" 
                            checked={status === 'Published'} 
                            onChange={(e) => setStatus(e.target.value)} 
                            disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="statusPublished">Published</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input 
                            className="form-check-input" 
                            type="radio" 
                            name="newsCategoryStatusRadio" 
                            id="statusUnpublished" 
                            value="Unpublished"
                            checked={status === 'Unpublished'} 
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="statusUnpublished">Unpublished</label>
                      </div>
                    </div>
                    <div className="col-lg-12 mt-4">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Category'}
                      </button>
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

export default AddNewsCategories;