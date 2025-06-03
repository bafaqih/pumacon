// src/pages/AddNews.jsx

import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import ReactQuill from 'react-quill-new'; // Saya asumsikan ini 'react-quill'
// import 'react-quill/dist/quill.snow.css'; 

const EditNews = () => {
  const navigate = useNavigate();

  // State untuk form fields
  const [newsId, setNewsId] = useState(''); // State baru untuk News ID
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [newsDateTime, setNewsDateTime] = useState('');
  
  const [isPublished, setIsPublished] = useState(true);
  const [enableComments, setEnableComments] = useState(false);

  const onDropCoverImage = useCallback(acceptedFiles => {
    setCoverImage(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
    console.log('Cover image accepted:', acceptedFiles);
  }, []);

  const { getRootProps: getCoverImageRootProps, getInputProps: getCoverImageInputProps, isDragActive: isCoverImageDragActive } = useDropzone({
    onDrop: onDropCoverImage,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: 1,
  });

  useEffect(() => {
    return () => coverImage.forEach(file => URL.revokeObjectURL(file.preview));
  }, [coverImage]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      form.classList.add('was-validated');
      return;
    }
    form.classList.add('was-validated');

    const finalStatus = isPublished ? 'published' : 'draft';

    const newsData = new FormData();
    newsData.append('newsId', newsId); // Menambahkan newsId
    newsData.append('title', title);
    if (coverImage.length > 0) {
      newsData.append('coverImage', coverImage[0]);
    }
    newsData.append('content', content);
    newsData.append('category', category);
    newsData.append('author', author);
    if (newsDateTime) {
      newsData.append('newsDateTime', newsDateTime);
    }
    newsData.append('status', finalStatus);
    newsData.append('enableComments', enableComments);

    console.log('Submitting News Post:', Object.fromEntries(newsData));
    alert(`News post ${finalStatus}! (Simulated)`);
    // navigate('/dashboard/news'); 
  };
  
  const handleAuthorChange = (e) => {
    setAuthor(e.target.value);
  };

  return (
    <main className="main-content-wrapper">
      <div className="container">
        <div className="row mb-9">
          <div className="col-md-12">
            <div>
              <h2>Edit News</h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to="/dashboard" className="text-inherit">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/dashboard/news" className="text-inherit">News</Link></li>
                  <li className="breadcrumb-item active" aria-current="page">Edit News</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <form className="row g-6 needs-validation" onSubmit={handleSubmit} noValidate>
              {/* Kolom Kiri (Form Utama) */}
              <div className="col-lg-8 col-12">
                <div className="card card-lg">
                  <div className="card-body p-6 d-flex flex-column gap-4">
                    <div className="col-12">
                      <label htmlFor="newsPostTitle" className="form-label">Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="newsPostTitle" 
                        placeholder="Post Title" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required 
                      />
                      <div className="invalid-feedback">Please enter post title.</div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Cover Image</label>
                      <div {...getCoverImageRootProps({ className: `dropzone mt-2 border-dashed rounded-2 min-h-0 ${isCoverImageDragActive ? 'border-primary' : ''}` })}>
                        <input {...getCoverImageInputProps()} />
                        {coverImage.length > 0 ? (
                          <div className="text-center p-4">
                            <img src={coverImage[0].preview} alt="Cover preview" style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: '0.25rem' }} />
                            <p className="mt-2 text-muted">Click to change image or drop a new one.</p>
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
                    <div className="col-12">
                      <label className="form-label">Content</label>
                      <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        style={{ height: '250px', marginBottom: '40px' }}
                        placeholder="Write your news content here..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Kolom Kanan (Settings) */}
              <div className="col-lg-4 col-12">
                <div className="card card-lg">
                  <div className="card-body p-6 d-flex flex-column gap-4">
                    {/* News ID Ditambahkan di sini */}
                    <div>
                        <label className="form-label" htmlFor="newsPostId">News ID</label>
                        <input 
                          type="text"
                          name="newsId" 
                          id="newsPostId" 
                          className="form-control"
                          placeholder="Enter News ID (e.g., NWS001)" 
                          value={newsId}
                          onChange={(e) => setNewsId(e.target.value)}
                          required // Sesuaikan jika wajib
                        />
                        <div className="invalid-feedback">Please enter News ID.</div>
                    </div>
                    <div>
                        <label htmlFor="newsCategory" className="form-label">Category</label>
                        <select 
                            className="form-select" 
                            id="newsCategory" 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Technology">Technology</option>
                            <option value="Business">Business</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Company News">Company News</option>
                        </select>
                        <div className="invalid-feedback">Please select a category.</div>
                    </div>
                    <div>
                        <label className="form-label" htmlFor="newsAuthor">Author</label>
                        <input 
                          type="text"
                          name="author" 
                          id="newsAuthor" 
                          className="form-control"
                          placeholder="Enter author name" 
                          value={author}
                          onChange={handleAuthorChange}
                          required
                        />
                        <div className="invalid-feedback">Please enter author name.</div>
                    </div>
                    <div>
                        <label className="form-label" htmlFor="newsDateTime">Date and Time</label>
                        <input 
                          type="datetime-local"
                          className="form-control"
                          id="newsDateTime"
                          value={newsDateTime}
                          onChange={(e) => setNewsDateTime(e.target.value)}
                          required
                        />
                        <div className="invalid-feedback">Please select date and time.</div>
                    </div>

                    {/* Publish Options */}
                    <div className="col-12 mt-3">
                        <div className="form-check form-switch ps-0">
                            <label className="form-check-label" htmlFor="publishNewsSwitch">Publish</label>
                            <input 
                                className="form-check-input ms-auto" 
                                type="checkbox" 
                                role="switch" 
                                id="publishNewsSwitch" 
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-12 mt-3">
                        <div className="d-flex flex-row gap-2">
                            <button className="btn btn-primary w-100" type="submit">Save Changes</button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditNews;