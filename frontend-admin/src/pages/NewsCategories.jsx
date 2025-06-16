import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Alert } from 'react-bootstrap';

const NewsCategories = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const getStatusClass = (status) => {
    if (!status) return 'bg-light-secondary text-dark-secondary';
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'published':
        return 'bg-light-success text-dark-success';
      case 'unpublished':
        return 'bg-light-warning text-dark-warning';
      default:
        return 'bg-light-secondary text-dark-secondary';
    }
  };

  const fetchNewsCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/news-categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Error fetching news categories:", err.response || err);
      setError(err.response?.data?.error || "Failed to load news categories.");
      if (err.response?.status === 401) {
        logout();
        navigate('/dashboard/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate, logout]);

  useEffect(() => {
    fetchNewsCategories();
  }, [fetchNewsCategories]);

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
      return;
    }
    
    setActionMessage(null);
    try {
      const response = await api.delete(`/admin/news-categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActionMessage({ type: 'success', text: response.data.message || 'Category deleted successfully!' });
      fetchNewsCategories(); 
    } catch (err) {
      console.error(`Error deleting category ${categoryId}:`, err.response || err);
      setActionMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to delete category.' });
    }
  };


  if (loading) {
    return <main className="main-content-wrapper"><div className="container p-5 text-center">Loading news categories...</div></main>;
  }

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
              <div>
                <h2>News Categories</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item"><Link to="/dashboard/news" className="text-inherit">News</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">News Categories</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/news/categories/add-category" className="btn btn-primary">Add New Category</Link>
              </div>
            </div>
          </div>
        </div>

        {actionMessage && <Alert variant={actionMessage.type} onClose={() => setActionMessage(null)} dismissible>{actionMessage.text}</Alert>}
        {error && !actionMessage && <Alert variant="danger">{error}</Alert>}

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
                      <option>All Status</option>
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
                        <th><div className="form-check"><input className="form-check-input" type="checkbox" id="checkAll" /><label className="form-check-label" htmlFor="checkAll"></label></div></th>
                        <th>Name</th>
                        <th>News</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <tr key={category.CategoryID}>
                            <td>
                              <div className="form-check">
                                <input className="form-check-input" type="checkbox" id={`cat-${category.CategoryID}`} />
                                <label className="form-check-label" htmlFor={`cat-${category.CategoryID}`}></label>
                              </div>
                            </td>
                            <td><Link to={`/dashboard/news/categories/${category.CategoryID}/edit`} className="text-reset">{category.CategoryName}</Link></td>
                            <td>{category.NewsPostCount || 0}</td> 
                            <td><span className={`badge ${getStatusClass(category.Status)}`}>{category.Status}</span></td>
                            <td>
                              <div className="dropdown">
                                <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                                  <i className="feather-icon icon-more-vertical fs-5"></i>
                                </Link>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button className="dropdown-item" onClick={() => handleDeleteCategory(category.CategoryID, category.CategoryName)}>
                                      <i className="bi bi-trash me-3"></i>Delete
                                    </button>
                                  </li>
                                  <li>
                                    <Link className="dropdown-item" to={`/dashboard/news/categories/${category.CategoryID}/edit`}>
                                      <i className="bi bi-pencil-square me-3"></i>Edit
                                    </Link>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center p-4">No categories found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border-top d-flex justify-content-between align-items-md-center px-6 py-6 flex-md-row flex-column gap-4">
                <span>Showing {categories.length} of {categories.length} entries</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default NewsCategories;