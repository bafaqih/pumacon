import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import ReactQuill from 'react-quill-new';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Alert } from 'react-bootstrap';

const EditNews = () => {
  const { newsId: paramNewsId } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validated, setValidated] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [status, setStatus] = useState('Published');

  const [newsIdDisplay, setNewsIdDisplay] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const backendAssetBaseUrl = 'http://localhost:8080';
  const getImageUrl = (imagePath) =>
    imagePath ? `${backendAssetBaseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}` : null;

  const formatDateForInput = (dateString) =>
    dateString ? new Date(dateString).toISOString().split('T')[0] : '';

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      setLoadingCategories(true);
      try {
        const res = await api.get('/admin/news-categories/list-active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Fetch categories error:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [token]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!paramNewsId || !token) {
        setErrorMessage("News ID missing or unauthorized.");
        setLoadingData(false);
        return;
      }
      setLoadingData(true);
      try {
        const res = await api.get(`/admin/news-posts/${paramNewsId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const post = res.data.news_post;
        if (post) {
          setTitle(post.Title || '');
          setContent(post.Content || '');
          setSelectedCategoryId(post.CategoryID || '');
          setPublicationDate(formatDateForInput(post.PublicationDate));
          setStatus(post.Status || 'Published');
          setNewsIdDisplay(post.NewsID || '');
          setAuthorName(post.Author?.FullName || 'N/A');
          setExistingImageUrl(post.Image || '');
        } else {
          setErrorMessage("Post not found.");
        }
      } catch (err) {
        console.error("Fetch post error:", err);
        setErrorMessage(err.response?.data?.error || "Failed to load post.");
        if (err.response?.status === 401) {
          logout();
          navigate('/dashboard/login', { replace: true });
        }
      } finally {
        setLoadingData(false);
      }
    };
    fetchPost();
  }, [paramNewsId, token, logout, navigate]);

  const onDropCoverImage = useCallback(files => {
    if (files && files.length > 0) {
      const file = files[0];
      setCoverImageFile(file);
      if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  }, [coverImagePreview]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropCoverImage,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1
  });

  useEffect(() => {
    return () => {
      if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    };
  }, [coverImagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setValidated(true);

    if (form.checkValidity() === false || !selectedCategoryId) {
      e.stopPropagation();
      if (!selectedCategoryId) setErrorMessage("Please select a category.");
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('jsonData', JSON.stringify({
      title, content, category_id: selectedCategoryId,
      publication_date: publicationDate, status
    }));

    if (coverImageFile) {
      formData.append('imageFile', coverImageFile);
    }

    try {
      const res = await api.put(`/admin/news-posts/${paramNewsId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage(res.data.message || 'Updated successfully!');
      setValidated(false);
      setTimeout(() => navigate('/dashboard/news'), 1500);
    } catch (err) {
      console.error("Update error:", err);
      setErrorMessage(err.response?.data?.error || "Failed to update.");
      if (err.response?.status === 401) {
        logout();
        navigate('/dashboard/login', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <main className="main-content-wrapper"><div className="container p-5 text-center">Loading...</div></main>;
  }

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <h2>Edit News Post</h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/dashboard/news">News</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Edit</li>
              </ol>
            </nav>
          </div>
        </div>

        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <form className={`row g-4 needs-validation ${validated ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
          <div className="col-lg-8">
            <div className="card card-lg p-4">
              <div className="mb-3">
                <label className="form-label">Title <span className="text-danger">*</span></label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
                <div className="invalid-feedback">Enter title.</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Cover Image</label>
                <div {...getRootProps({ className: `dropzone mt-2 border-dashed rounded-2` })}>
                  <input {...getInputProps()} disabled={loading} />
                  {coverImagePreview || existingImageUrl ? (
                    <img src={coverImagePreview || getImageUrl(existingImageUrl)} alt="Cover" className="img-fluid rounded" style={{ maxHeight: '150px' }} />
                  ) : (
                    <div className="text-center p-5 text-muted">Drop or click to upload</div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Content <span className="text-danger">*</span></label>
                <ReactQuill value={content} onChange={setContent} readOnly={loading} style={{ height: '250px', marginBottom: '40px' }} />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card card-lg p-4">
              <div className="mb-3">
                <label className="form-label">News ID</label>
                <input type="text" className="form-control" value={newsIdDisplay} readOnly />
              </div>

              <div className="mb-3">
                <label className="form-label">Author</label>
                <input type="text" className="form-control" value={authorName} readOnly />
              </div>

              <div className="mb-3">
                <label className="form-label">Category <span className="text-danger">*</span></label>
                <select className="form-select" value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} required disabled={loading || loadingCategories}>
                  <option value="">{loadingCategories ? 'Loading...' : 'Select category'}</option>
                  {categories.map(cat => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                  ))}
                </select>
                <div className="invalid-feedback">Select category.</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Publish Date <span className="text-danger">*</span></label>
                <input type="date" className="form-control" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} required disabled={loading} />
                <div className="invalid-feedback">Select date.</div>
              </div>

              <div className="mb-3">
                <label className="form-label">Status</label>
                <div className="d-flex gap-2">
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="status" id="published" value="Published" checked={status === 'Published'} onChange={(e) => setStatus(e.target.value)} />
                    <label className="form-check-label" htmlFor="published">Published</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="status" id="draft" value="Draft" checked={status === 'Draft'} onChange={(e) => setStatus(e.target.value)} />
                    <label className="form-check-label" htmlFor="draft">Draft</label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditNews;
