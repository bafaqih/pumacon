import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useCallback } from "react";
import apiClient from '../../services/apiClient';
import { Alert } from 'react-bootstrap';

const NewsDetail = () => {
    const { id: newsId } = useParams(); 
    const location = useLocation();

    // State untuk data dari API
    const [postDetail, setPostDetail] = useState(null);
    const [categories, setCategories] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    
    // State untuk UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Helper Functions
    const backendAssetBaseUrl = 'http://localhost:8080';
    const defaultNewsImage = '/images/blog/default-blog.jpg';
    const defaultAvatar = '/images/avatar/default-avatar.png';

    const getImageUrl = (imagePath) => {
        if (!imagePath) return defaultNewsImage;
        if (imagePath.startsWith('http')) return imagePath;
        return `${backendAssetBaseUrl}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
    };

    const getAvatarUrl = (imagePath) => {
        if (!imagePath) return defaultAvatar;
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


    useEffect(() => {
        const fetchPageData = async () => {
            if (!newsId) {
                setError("News ID not found in URL.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const response = await apiClient.get(`/news/${newsId}`);
                const data = response.data;
                
                setPostDetail(data.post_detail || null);
                setCategories(data.categories || []);
                setRecentPosts(data.recent_posts || []);

                if (!data.post_detail) {
                    setError(`News post with ID ${newsId} not found.`);
                }

                if (window.WOW) {
                    setTimeout(() => new window.WOW({ live: false }).init(), 100);
                }

            } catch (err) {
                console.error("Error fetching news detail data:", err.response || err);
                setError(err.response?.data?.error || "Failed to load news post.");
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [newsId]); 


    if (loading) {
        return <div style={{ paddingTop: '100px' }}><div className="container p-5 text-center"><h1>Loading News...</h1></div></div>;
    }
    
    if (error || !postDetail) {
        return (
            <div style={{ paddingTop: '100px' }}>
                <div className="container p-5">
                    <Alert variant="danger">{error || "Post not found."}</Alert>
                    <Link to="/news" className="btn btn-primary mt-3">Back to News List</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '100px' }}>
            <div className="dz-bnr-inr dz-bnr-inr-sm text-center overlay-primary-dark" style={{ backgroundImage: "url('/images/banner/bnr1.jpg')"}}>
                <div className="container">
                    <div className="dz-bnr-inr-entry">
                        <h1>News Details</h1>
                        <nav aria-label="breadcrumb" className="breadcrumb-row m-t15">
                            <ul className="breadcrumb">
                                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                                <li className="breadcrumb-item"><Link to="/news">News</Link></li>
                                <li className="breadcrumb-item active" aria-current="page">News Details</li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        
            <section className="content-inner bg-white position-relative">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-8 col-lg-8">
                            <div className="blog-single pt-20 sidebar dz-card">
                                <div className="dz-media dz-media-rounded rounded">
                                    <img src={getImageUrl(postDetail.image)} alt={postDetail.title}/>
                                </div>
                                <div className="dz-info m-b30">
                                    <div className="dz-meta">
                                        <ul>
                                            <li className="post-author">
                                                <a href="#!">
                                                    <img src={getAvatarUrl(postDetail.author.image)} alt={postDetail.author.full_name} /> 
                                                    <span>By {postDetail.author.full_name || 'Admin'}</span>
                                                </a>
                                            </li>
                                            <li className="post-date"><a href="#!">{formatDateTime(postDetail.publication_date)}</a></li>
                                        </ul>
                                    </div>
                                    <h3 className="dz-title">{postDetail.title}</h3>
                                    <div className="dz-post-text">
                                        <div dangerouslySetInnerHTML={{ __html: postDetail.content }} />
                                    </div>
                                </div>
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
                                        {categories.map(cat => (
                                            <li className="cat-item" key={cat.category_id}>
                                                <Link to={`/news/category/${cat.category_id}`}>{cat.category_name} ({cat.post_count})</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="widget recent-posts-entry">
                                    <div className="widget-title"><h4 className="title">Recent Post</h4></div>
                                    <div className="widget-post-bx">
                                        {recentPosts.map(post => (
                                            <div className="widget-post clearfix" key={post.news_id}>
                                                <div className="dz-media">
                                                    <Link to={`/news/${post.news_id}`}><img src={getImageUrl(post.image)} alt={post.title}/></Link>
                                                </div>
                                                <div className="dz-info">
                                                    <h6 className="title"><Link to={`/news/${post.news_id}`}>{post.title}</Link></h6>
                                                    <div className="dz-meta">
                                                        <ul>
                                                            <li className="post-date"><a href="#!">{formatDateTime(post.publication_date)}</a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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

export default NewsDetail;