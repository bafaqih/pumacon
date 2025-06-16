import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import ReactQuill from 'react-quill-new';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Alert } from 'react-bootstrap';

const AddNews = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [title, setTitle] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [content, setContent] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [status, setStatus] = useState('Published');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    const fetchActiveCategories = async () => {
      if (!token) return;
      setLoadingCategories(true);
      try {
        const response = await api.get('/admin/news-categories/list-active', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch active news categories:", err.response || err);
        setErrorMessage("Could not load news categories.");
        if (err.response?.status === 401) logout();
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchActiveCategories();
  }, [token, logout]);

  const onDropCoverImage = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropCoverImage,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  useEffect(() => {
    return () => {
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setValidated(true);

    if (form.checkValidity() === false || !selectedCategoryId) {
      event.stopPropagation();
      if (!selectedCategoryId) setErrorMessage("Please select a category.");
      return;
    }

    setLoadingSubmit(true);
    setErrorMessage('');
    setSuccessMessage('');

    const formDataPayload = new FormData();
    const newsData = {
      title,
      content,
      category_id: selectedCategoryId,
      publication_date: publicationDate,
      status,
    };
    formDataPayload.append('jsonData', JSON.stringify(newsData));
    if (coverImageFile) {
      formDataPayload.append('imageFile', coverImageFile);
    }

    try {
      const response = await api.post('/admin/news-posts', formDataPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage(response.data.message || 'News post created successfully!');
      setTitle('');
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setContent('');
      setSelectedCategoryId('');
      setPublicationDate('');
      setStatus('Published');
      setValidated(false);

      setTimeout(() => navigate('/dashboard/news'), 1500);
    } catch (err) {
      console.error("Error creating news post:", err.response || err);
      setErrorMessage(err.response?.data?.error || "Failed to create post. Please try again.");
      if (err.response?.status === 401) {
        logout();
        navigate('/dashboard/login', { replace: true });
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-8">
          <div className="col-md-12">
            <div>
              <h2>Create a New News Post</h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/dashboard/news" className="text-inherit">News</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Create New Post</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <form className={`row g-6 needs-validation ${validated ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
          <div className="col-lg-8 col-12">
            <div className="card card-lg">
              <div className="card-body p-6 d-flex flex-column gap-4">
                <div>
                  <label htmlFor="newsPostTitle" className="form-label">Title <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="newsPostTitle"
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={loadingSubmit}
                  />
                  <div className="invalid-feedback">Please enter post title.</div>
                </div>

                <div>
                  <label className="form-label">Cover Image</label>
                  <div {...getRootProps({ className: 'dropzone mt-2 border-dashed rounded-2 min-h-0' })}>
                    <input {...getInputProps()} disabled={loadingSubmit} />
                    {coverImagePreview ? (
                      <div className="text-center p-4">
                        <img src={coverImagePreview} alt="Cover preview" style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '0.25rem' }} />
                        <p className="mt-2 text-muted">Click or drop a new image to replace.</p>
                      </div>
                    ) : (
                      <div className="dz-message needsclick py-5">
                        <i className="bi bi-cloud-arrow-up fs-1"></i>
                        <h4 className="mb-1">Drop cover image here or click to upload.</h4>
                        <span className="text-muted">(Max 1 image, e.g., .png, .jpg)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">Content <span className="text-danger">*</span></label>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    style={{ height: '250px', marginBottom: '40px' }}
                    placeholder="Write your news content here..."
                    readOnly={loadingSubmit}
                  />
                </div>

                <div className="d-lg-none mt-4">
                  <div className="d-grid">
                    <button className="btn btn-primary" type="submit" disabled={loadingSubmit}>
                      {loadingSubmit ? 'Posting...' : 'Post News'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-12">
            <div className="card card-lg">
              <div className="card-body p-6 d-flex flex-column gap-4">
                <div>
                  <label htmlFor="newsCategory" className="form-label">Category <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    id="newsCategory"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    required
                    disabled={loadingSubmit || loadingCategories}
                  >
                    <option value="">{loadingCategories ? 'Loading...' : 'Select Category'}</option>
                    {categories.map(cat => (
                      <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                    ))}
                  </select>
                  <div className="invalid-feedback">Please select a category.</div>
                </div>

                <div>
                  <label htmlFor="newsDateTime" className="form-label">Publish Date and Time <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    id="newsDateTime"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e.target.value)}
                    required
                    disabled={loadingSubmit}
                  />
                  <div className="invalid-feedback">Please select a date.</div>
                </div>

                <div className="mt-3">
                  <label className="form-label">Status</label>
                  <div className="d-flex flex-wrap gap-3">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="newsStatusRadio" id="statusPublished" value="Published" checked={status === 'Published'} onChange={(e) => setStatus(e.target.value)} disabled={loadingSubmit} />
                      <label className="form-check-label" htmlFor="statusPublished">Publish</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="newsStatusRadio" id="statusDraft" value="Draft" checked={status === 'Draft'} onChange={(e) => setStatus(e.target.value)} disabled={loadingSubmit} />
                      <label className="form-check-label" htmlFor="statusDraft">Draft</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-grid mt-4 d-none d-lg-block">
              <button className="btn btn-primary" type="submit" disabled={loadingSubmit}>
                {loadingSubmit ? 'Posting...' : 'Post News'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AddNews;
