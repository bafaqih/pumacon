import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Alert, Button } from 'react-bootstrap';

const News = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const publicSiteBaseUrl = 'http://localhost:5173';

  const [allNews, setAllNews] = useState([]);
  const [currentDisplayNews, setCurrentDisplayNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const defaultNewsImage = '/assets/images/default-news-image.jpg';
  const backendAssetBaseUrl = 'http://localhost:8080';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return defaultNewsImage;
    if (imagePath.startsWith('http')) return imagePath;
    return `${backendAssetBaseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch (e) { return dateString; }
  };

  const getStatusClass = (status) => {
    if (!status) return 'bg-light-secondary text-dark-secondary';
    const statusLower = status.toLowerCase();
    return statusLower === 'published' ? 'bg-light-success text-dark-success' : 'bg-light-danger text-dark-danger';
  };

  const fetchNewsPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/news-posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllNews(response.data.news_posts || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching news posts:", err.response || err);
      setError(err.response?.data?.error || "Failed to load news posts.");
      if (err.response?.status === 401) { logout(); navigate('/dashboard/login', { replace: true }); }
    } finally {
      setLoading(false);
    }
  }, [token, navigate, logout]);

  useEffect(() => {
    fetchNewsPosts();
    if (window.WOW) {
      setTimeout(() => new window.WOW({ live: false, offset: 50 }).init(), 100);
    }
  }, [fetchNewsPosts]);

  useEffect(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    setCurrentDisplayNews(allNews.slice(indexOfFirstPost, indexOfLastPost));
  }, [currentPage, allNews, postsPerPage]);

  const totalPages = Math.ceil(allNews.length / postsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleDeletePost = async (newsId, newsTitle) => {
    if (!window.confirm(`Are you sure you want to delete the post "${newsTitle}"?`)) return;
    
    setActionMessage(null);
    try {
        const response = await api.delete(`/admin/news-posts/${newsId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setActionMessage({ type: 'success', text: response.data.message || 'Post deleted successfully!' });
        fetchNewsPosts(); 
    } catch (err) {
        console.error(`Error deleting post ${newsId}:`, err.response || err);
        setActionMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to delete post.' });
    }
  };

  if (loading) {
    return <main className="main-content-wrapper"><div className="container p-5 text-center">Loading news posts...</div></main>;
  }

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div className="d-flex flex-row justify-content-between align-items-center">
              <div>
                <h2>News Posts</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">News</li>
                  </ol>
                </nav>
              </div>
              <div>
                <Link to="/dashboard/news/add-post" className="btn btn-primary">New Post</Link>
              </div>
            </div>
          </div>
        </div>

        {actionMessage && <Alert variant={actionMessage.type} onClose={() => setActionMessage(null)} dismissible>{actionMessage.text}</Alert>}
        {error && !actionMessage && <Alert variant="danger">{error}</Alert>}

        <div className="row">
          <div className="col-xl-12 col-12 mb-5">
            <div className="row justify-content-between d-flex flex-md-row flex-column gap-2 mb-4">
              <div className="col-lg-4 col-md-4 col-12">
                <form className="d-flex" role="search">
                  <input className="form-control" type="search" placeholder="Search News Post" aria-label="Search" id="postSearch" />
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-6">
          {currentDisplayNews.length > 0 ? (
            currentDisplayNews.map((newsItem) => (
              <div className="col-lg-4 col-md-6 col-12" key={newsItem.news_id}>
                <div className="card card-lg rounded-4 border-0 card-lift h-100">
                  <a href={`${publicSiteBaseUrl}/news/${newsItem.news_id}`} className="img-zoom rounded-bottom-0" target="_blank" rel="noopener noreferrer">
                    <img src={getImageUrl(newsItem.image)} alt={newsItem.title} className="img-fluid rounded-top-4 w-100" style={{objectFit: 'cover', height: '200px'}} onError={(e) => { e.target.onerror = null; e.target.src=defaultNewsImage; }} />
                  </a>
                  <div className="card-body d-flex flex-column gap-4 p-6">
                    <div className="d-flex flex-row justify-content-between align-items-center">
                      <span className={`badge ${getStatusClass(newsItem.status)}`}>{newsItem.status}</span>
                      <div>
                        <div className="dropdown">
                          <Link to="#" className="text-reset" data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="feather-icon icon-more-vertical fs-5"></i>
                          </Link>
                          <ul className="dropdown-menu">
                            <li>
                                <a 
                                  className="dropdown-item" 
                                  href={`${publicSiteBaseUrl}/news/${newsItem.news_id}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <i className="bi bi-eye-fill me-3"></i>View
                                </a>
                              </li>
                            <li>
                              <Link className="dropdown-item" to={`/dashboard/news/${newsItem.news_id}/edit`}>
                                <i className="bi bi-pencil-square me-3"></i>Edit
                              </Link>
                            </li>
                            <li>
                              <button className="dropdown-item text-danger" onClick={() => handleDeletePost(newsItem.news_id, newsItem.title)}>
                                <i className="bi bi-trash me-3"></i>Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <h3 className="mb-0 h5">
                      <Link to={`/dashboard/news/${newsItem.news_id}/edit`} className="text-reset">{newsItem.title}</Link>
                    </h3>
                    <div className="d-flex flex-row justify-content-between align-items-center">
                      <small className="text-black-50">{formatDate(newsItem.publication_date)}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center p-5">
              <h4>No news posts found.</h4>
              <p>You can start by creating a new post.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
            <div className="row">
              <div className="col-12">
                  <nav className="mt-7 mt-lg-10">
                    <ul className="pagination justify-content-center mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => paginate(currentPage - 1)}>&laquo; Previous</button>
                        </li>
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next &raquo;</button>
                        </li>
                    </ul>
                  </nav>
              </div>
            </div>
        )}
      </div>
    </main>
  );
};

export default News;