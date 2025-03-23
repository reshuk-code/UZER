import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { UserApi } from './User/UserApi/UserApi';
import { ProductApi } from './ProductApi';
import { useCart } from './Cart/CartContext';
import { useWishlist } from './WishlistContext';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import './ProductDetails.css';

const ProductDetails = () => {
    // 1. URL Parameters and Context
    const { productId } = useParams();
    const { addToCart } = useCart();
    const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
    
    // 2. State Management
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [reviews, setReviews] = useState([]);
    const [editingReview, setEditingReview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mediaPreviews, setMediaPreviews] = useState({
        images: [],
        videos: []
    });
    const [newReview, setNewReview] = useState({
        rating: 0,
        comment: '',
        images: [],
        videos: []
    });

    // 3. Authentication Check
    const { user, isAuthenticated } = useAuth();
    
    const canSubmitReview = useMemo(() => {
        return isAuthenticated() && Boolean(user?._id);
    }, [isAuthenticated, user]);



    // 4. Memoized Values
    const images = useMemo(() => {
        if (!product?.images) return [];
        return product.images.map(img => ({
            original: img.path,
            thumbnail: img.path
        }));
    }, [product?.images]);

    const isInWishlist = useMemo(() => {
        return wishlistItems.some(item => item._id === product?._id);
    }, [wishlistItems, product?._id]);

    // 5. Data Fetching
    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [productRes, reviewsRes] = await Promise.all([
                    ProductApi.getProductDetails(productId),
                    UserApi.getProductReviews(productId)
                ]);

                if (!mounted) return;

                if (productRes.success && productRes.product) {
                    setProduct(productRes.product);
                    if (productRes.product.colors?.length > 0) {
                        setSelectedColor(productRes.product.colors[0]);
                    }
                }

                if (reviewsRes.success) {
                    setReviews(reviewsRes.reviews);
                }
            } catch (error) {
                if (mounted) {
                    setError(error.message || 'Failed to load product');
                    toast.error(error.message || 'Failed to load product');
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();
        return () => { mounted = false; };
    }, [productId]);

    // 6. Event Handlers
    const handleAddToCart = () => {
        if (!product || product.stock < quantity) {
            toast.error('Not enough stock available');
            return;
        }
        addToCart({ ...product, quantity, selectedColor });
        toast.success('Added to cart');
    };

    const handleEditReview = (review) => {
        if (!canSubmitReview) {
            toast.error('Please login to edit reviews');
            return;
        }

        setEditingReview({
            ...review,
            images: [],
            videos: []
        });
        setMediaPreviews({
            images: review.images || [],
            videos: review.videos || []
        });

        // Scroll to review form
        document.querySelector('.add-review').scrollIntoView({ behavior: 'smooth' });
    };
    
    useEffect(() => {
        console.log('Auth state:', {
            isAuthenticated: isAuthenticated(),
            user,
            storedUser: localStorage.getItem('user'),
            storedToken: localStorage.getItem('token'),
            canSubmitReview
        });
    }, [isAuthenticated, user, canSubmitReview]);

    // Update review ownership check
    const isReviewOwner = (review) => {
        const userData = localStorage.getItem('user');
        if (!userData) return false;
        
        try {
            const parsedUser = JSON.parse(userData);
            return review.user._id === parsedUser._id;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return false;
        }
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        if (!editingReview || !canSubmitReview) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('rating', editingReview.rating);
            formData.append('comment', editingReview.comment);
            
            editingReview.images?.forEach(image => {
                formData.append('images', image);
            });

            editingReview.videos?.forEach(video => {
                formData.append('videos', video);
            });

            await UserApi.updateProductReview(productId, editingReview._id, formData);
            
            const reviewsRes = await UserApi.getProductReviews(productId);
            if (reviewsRes.success) {
                setReviews(reviewsRes.reviews);
            }

            setEditingReview(null);
            setMediaPreviews({ images: [], videos: [] });
            toast.success('Review updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!canSubmitReview) {
            toast.error('Please login to delete reviews');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            setIsSubmitting(true);
            await UserApi.deleteProductReview(productId, reviewId);
            setReviews(reviews.filter(r => r._id !== reviewId));
            toast.success('Review deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMedia = async (reviewId, mediaId, mediaType) => {
        if (!canSubmitReview) {
            toast.error('Please login to delete media');
            return;
        }

        try {
            await UserApi.deleteReviewMedia(productId, reviewId, mediaId, mediaType);
            const reviewsRes = await UserApi.getProductReviews(productId);
            if (reviewsRes.success) {
                setReviews(reviewsRes.reviews);
            }
            toast.success('Media deleted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to delete media');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmitReview) {
            toast.error('Please login to submit a review');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('rating', newReview.rating);
            formData.append('comment', newReview.comment);
            
            newReview.images.forEach(image => {
                formData.append('images', image);
            });

            newReview.videos.forEach(video => {
                formData.append('videos', video);
            });

            await UserApi.addProductReview(productId, formData);
            
            const reviewsRes = await UserApi.getProductReviews(productId);
            if (reviewsRes.success) {
                setReviews(reviewsRes.reviews);
            }
            
            setNewReview({ rating: 0, comment: '', images: [], videos: [] });
            setMediaPreviews({ images: [], videos: [] });
            toast.success('Review submitted successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 7. Review Form Component
    const ReviewForm = () => (
        <form onSubmit={editingReview ? handleUpdateReview : handleReviewSubmit}>
            <div className="rating">
                {[1, 2, 3, 4, 5].map(star => (
                    <FaStar
                        key={star}
                        className={`star ${star <= (editingReview?.rating || newReview.rating) ? 'active' : ''}`}
                        onClick={() => editingReview 
                            ? setEditingReview(prev => ({ ...prev, rating: star }))
                            : setNewReview(prev => ({ ...prev, rating: star }))
                        }
                    />
                ))}
            </div>
            <textarea
                value={editingReview?.comment || newReview.comment}
                onChange={e => editingReview
                    ? setEditingReview(prev => ({ ...prev, comment: e.target.value }))
                    : setNewReview(prev => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Write your review..."
                required
            />
            <div className="media-upload">
                <label className="btn btn-outline-secondary">
                    Add Images
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => editingReview
                            ? setEditingReview(prev => ({ 
                                ...prev, 
                                images: [...prev.images, ...Array.from(e.target.files)]
                            }))
                            : setNewReview(prev => ({ 
                                ...prev, 
                                images: [...prev.images, ...Array.from(e.target.files)]
                            }))
                        }
                    />
                </label>
                <label className="btn btn-outline-secondary ms-2">
                    Add Videos
                    <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={e => editingReview
                            ? setEditingReview(prev => ({ 
                                ...prev, 
                                videos: [...prev.videos, ...Array.from(e.target.files)]
                            }))
                            : setNewReview(prev => ({ 
                                ...prev, 
                                videos: [...prev.videos, ...Array.from(e.target.files)]
                            }))
                        }
                    />
                </label>
            </div>
            {(mediaPreviews.images.length > 0 || mediaPreviews.videos.length > 0) && (
                <div className="media-previews">
                    {mediaPreviews.images.map((image, index) => (
                        <div key={`preview-img-${index}`} className="preview-item">
                            <img src={"https://uzer-server.onrender.com"+image.path} alt={`Preview ${index + 1}`} />
                            <button
                                type="button"
                                className="remove-preview"
                                onClick={() => {
                                    const newPreviews = mediaPreviews.images.filter((_, i) => i !== index);
                                    setMediaPreviews(prev => ({ ...prev, images: newPreviews }));
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {mediaPreviews.videos.map((video, index) => (
                        <div key={`preview-vid-${index}`} className="preview-item">
                            <video controls>
                                <source src={video.path} type="video/mp4" />
                            </video>
                            <button
                                type="button"
                                className="remove-preview"
                                onClick={() => {
                                    const newPreviews = mediaPreviews.videos.filter((_, i) => i !== index);
                                    setMediaPreviews(prev => ({ ...prev, videos: newPreviews }));
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-3">
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting 
                        ? 'Submitting...' 
                        : editingReview 
                            ? 'Update Review' 
                            : 'Submit Review'
                    }
                </button>
                {editingReview && (
                    <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => {
                            setEditingReview(null);
                            setMediaPreviews({ images: [], videos: [] });
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );

    // 8. Review List Component
    const renderReviewsList = () => (
        <div className="reviews-list">
            {reviews.map(review => (
                <div key={review._id} className="review-card">
                    <div className="review-header">
                        <div className="user-info">
                            <span className="user">
                                {review.user.firstName} {review.user.lastName}
                            </span>
                            <span className="date">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        {isReviewOwner(review) && (
                            <div className="review-actions">
                                <button 
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => handleEditReview(review)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteReview(review._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="rating">
                        {[...Array(5)].map((_, index) => (
                            <FaStar
                                key={index}
                                className={`star ${index < review.rating ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    {(review.images?.length > 0 || review.videos?.length > 0) && (
                        <div className="review-media">
                            {review.images?.map((image, index) => (
                                <div key={`img-${index}`} className="media-item">
                                    <img 
                                        src={"https://uzer-server.onrender.com"+image.path} 
                                        alt={`Review ${index + 1}`} 
                                        onClick={() => window.open(image.path, '_blank')}
                                    />
                                    {review.user._id === localStorage.getItem('userId') && (
                                        <button 
                                            className="delete-media"
                                            onClick={() => handleDeleteMedia(review._id, image._id, 'image')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            {review.videos?.map((video, index) => (
                                <div key={`vid-${index}`} className="media-item">
                                    <video controls>
                                        <source src={video.path} type="video/mp4" />
                                    </video>
                                    {review.user._id === localStorage.getItem('userId') && (
                                        <button 
                                            className="delete-media"
                                            onClick={() => handleDeleteMedia(review._id, video._id, 'video')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // 9. Loading & Error States
    if (loading) return (
        <div className="container mt-5 pt-5">
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="container mt-5 pt-5">
            <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
            </div>
        </div>
    );

    if (!product) return (
        <div className="container mt-5 pt-5">
            <div className="alert alert-warning">Product not found</div>
        </div>
    );

    // 10. Main Render
    return (
        <div className="container mt-5 pt-5">
            <div className="product-details-container">
                {/* Product Information Section */}
                <div className="row">
                    <div className="col-md-6">
                        <ImageGallery 
                            items={images} 
                            showPlayButton={false}
                            showFullscreenButton={true}
                            showNav={true}
                        />
                    </div>
                    <div className="col-md-6">
                        <h1>{product.name}</h1>
                        <div className="price-stock">
                            <h2>₹{product.price.toFixed(2)}</h2>
                            <span className={`stock ${product.stock > 0 ? 'in' : 'out'}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                        </div>
                        <p className="description">{product.description}</p>
                        
                        {/* Colors Section */}
                        {product.colors?.length > 0 && (
                            <div className="colors-container">
                                <h3>Colors</h3>
                                <div className="color-options">
                                    {product.colors.map(color => (
                                        <button
                                            key={color}
                                            className={`color-btn ${selectedColor === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setSelectedColor(color)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Section */}
                        <div className="quantity-container">
                            <button 
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="qty-btn"
                                disabled={product.stock === 0}
                            >
                                -
                            </button>
                            <input 
                                type="number" 
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                                min="1"
                                max={product.stock}
                                disabled={product.stock === 0}
                            />
                            <button 
                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                className="qty-btn"
                                disabled={product.stock === 0}
                            >
                                +
                            </button>
                        </div>

                        {/* Actions Section */}
                        <div className="actions">
                            <button 
                                className="btn btn-primary"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                Add to Cart
                            </button>
                            <button 
                                className={`btn ${isInWishlist ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => isInWishlist ? removeFromWishlist(product._id) : addToWishlist(product)}
                            >
                                <i className="bi bi-heart-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section mt-5">
                    <h2>Customer Reviews</h2>
                    <div className="add-review">
                        {!canSubmitReview ? (
                            <div className="alert alert-info">
                                Please <a href="/login">log in</a> to submit a review
                            </div>
                        ) : (
                            <ReviewForm />
                        )}
                    </div>
                    {renderReviewsList()}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;