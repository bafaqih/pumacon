import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../../services/apiClient'; 
import { Alert } from 'react-bootstrap'; 

const News = () => {
    // State untuk data dari API
    const [newsPosts, setNewsPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState(null);
    
    // State untuk UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // Fungsi helper
    const backendAssetBaseUrl = 'http://localhost:8080';
    const defaultNewsImage = '/images/blog/default-blog.jpg'

    const getImageUrl = (imagePath) => {
        if (!imagePath) return defaultNewsImage;
        if (imagePath.startsWith('http')) return imagePath;
        return `${backendAssetBaseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Date not available';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return dateString; }
    };


    const fetchData = useCallback(async (page) => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get(`/news?page=${page}&limit=5`); 
            const data = response.data;
            
            setNewsPosts(data.news || []);
            setCategories(data.categories || []);
            setPagination(data.pagination || null);

            if (window.WOW && (data.news || []).length > 0) {
                setTimeout(() => new window.WOW({ live: false, offset: 50 }).init(), 100);
            }

        } catch (err) {
            console.error("Error fetching news page data:", err.response || err);
            setError(err.response?.data?.error || "Failed to load news. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, fetchData]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination?.total_pages || 1)) {
            setSearchParams({ page: newPage });
        }
    };

    if (error) {
        return (
            <div style={{ paddingTop: '100px' }}>
                <div className="container p-5">
                    <Alert variant="danger">{error}</Alert>
                </div>
            </div>
        );
    }
    
    return (
        <div style={{ paddingTop: location.pathname === "/" ? '0px' : '100px' }}>
            <div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('/images/banner/bnr1.jpg')"}}>
                <div className="container">
                    <div className="dz-bnr-inr-entry">
                        <h1>Latest News</h1>
                        <nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
                            <ul className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">News</li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
    
            <section className="content-inner bg-white position-relative">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-8 col-lg-8">
                            <div className="row">
                                {newsPosts.length > 0 ? (
                                    newsPosts.map((post, index) => (
                                        <div className="col-lg-12" key={post.news_id}>
                                            <div className="dz-card style-1 blog-half overlay-shine wow fadeInUp" data-wow-delay={`${(index * 0.2) + 0.2}s`}>
                                                <div className="dz-media">
                                                    <Link to={`/news/${post.news_id}`}><img src={getImageUrl(post.image)} alt={post.title}/></Link>
                                                    <div className="date">{formatDateTime(post.publication_date)}</div>
                                                </div>
                                                <div className="dz-info">
                                                    <div className="dz-meta">
                                                        <ul>
                                                            <li className="post-author"><i className="fa-solid fa-user"></i> By <span className="text-primary">{post.author_name || 'Admin'}</span></li>                                         
                                                        </ul>
                                                    </div>
                                                    <h5 className="dz-title"><Link to={`/news/${post.news_id}`}>{post.title || "Untitled Post"}</Link></h5>
                                                    <p>{post.content_snippet || 'No summary available.'}</p>
                                                    <Link to={`/news/${post.news_id}`} className="btn btn-gray">Read More</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center p-5">
                                        <h4>No news posts found.</h4>
                                    </div>
                                )}
                                
                                {pagination && pagination.total_pages > 1 && (
                                    <div className="col-lg-12">
                                        <nav aria-label="Blog Pagination">
                                            <ul className="pagination style-2 text-center wow fadeInUp" data-wow-delay="0.8s">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button className="page-link prev" onClick={() => handlePageChange(currentPage - 1)}><i className="fas fa-chevron-left"></i></button>
                                                </li>
                                                {[...Array(pagination.total_pages).keys()].map(number => (
                                                    <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                                                        <button className="page-link" onClick={() => handlePageChange(number + 1)}>{number + 1}</button>
                                                    </li>
                                                ))}
                                                <li className={`page-item ${currentPage === pagination.total_pages ? 'disabled' : ''}`}>
                                                    <button className="page-link next" onClick={() => handlePageChange(currentPage + 1)}><i className="fas fa-chevron-right"></i></button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-4">
                            <aside className="side-bar sticky-top right">
                                <div className="widget">
                                    <div className="widget-title"><h4 className="title">Search</h4></div>
                                    <div className="search-bx">
                                        <form role="search" method="post">
                                            <div className="input-group">
                                                <input name="text" className="form-control style-1" placeholder="Search.." type="text"/>
                                                <span className="input-group-btn">
                                                    <button type="submit" className="btn btn-primary sharp radius-no"><i className="fa-solid fa-magnifying-glass scale3"></i></button>
                                                </span>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="widget widget_categories">
                                    <div className="widget-title"><h4 className="title">Categories</h4></div>
                                    <ul>
                                        {categories.length > 0 ? (
                                            categories.map(cat => (
                                                <li className="cat-item" key={cat.category_id}>
                                                    <Link to={`/news/category/${cat.category_id}`}>{cat.category_name} ({cat.post_count})</Link>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="cat-item">No categories found.</li>
                                        )}
                                    </ul>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </section>
		
		<section className="content-inner-2 border-top">
			<div className="container">
				<div className="row">
					<div className="col-xl-3 col-md-6 col-sm-6 m-b30 wow fadeInUp" data-wow-delay="0.2s">
						<div className="icon-bx-wraper style-1">
							<div className="icon-media"> 
								<img src="public/images/logo/logo1.png" alt=""/>
							</div>
							<div className="icon-content">
								<h6 className="title">Free Shipping</h6>
								<p className="text">Shipping On All Order.</p>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-md-6 col-sm-6 m-b30 wow fadeInUp" data-wow-delay="0.4s">
						<div className="icon-bx-wraper style-1">
							<div className="icon-media"> 
								<img src="public/images/logo/logo2.png" alt=""/>
							</div>
							<div className="icon-content">
								<h6 className="title">Money Guarantee</h6>
								<p className="text">30 Day Money Back</p>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-md-6 col-sm-6 m-b30 wow fadeInUp" data-wow-delay="0.6s">
						<div className="icon-bx-wraper style-1">
							<div className="icon-media"> 
								<img src="public/images/logo/logo3.png" alt=""/>
							</div>
							<div className="icon-content">
								<h6 className="title">Online Support 24/7</h6>
								<p className="text">Technical Support 24/7 </p>
							</div>
						</div>
					</div>
					<div className="col-xl-3 col-md-6 col-sm-6 m-b30 wow fadeInUp" data-wow-delay="0.8s">
						<div className="icon-bx-wraper style-1">
							<div className="icon-media"> 
								<img src="public/images/logo/logo4.png" alt=""/>
							</div>
							<div className="icon-content">
								<h6 className="title">Safe Payment</h6>
								<p className="text">Transfer a Payment </p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
		
	</div>
  );
};

export default News;