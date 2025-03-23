import React, { useState, useEffect } from 'react';
import { UserApi } from './User/UserApi/UserApi';
import { Link } from 'react-router-dom';
import { useCart } from './Cart/CartContext';
import './Wishlist.css';

const Wishlist = ({ setAlert }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();

    const fetchWishlist = async () => {
        try {
            setIsLoading(true);
            const response = await UserApi.getWishlist();
            setWishlistItems(response.wishlist || []);
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to fetch wishlist',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveFromWishlist = async (productId) => {
        try {
            await UserApi.removeFromWishlist(productId);
            await fetchWishlist();
            setAlert({
                show: true,
                message: 'Product removed from wishlist',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to remove product',
                type: 'danger'
            });
        }
    };

    const handleMoveToCart = async (product) => {
        try {
            await addToCart(product);
            await handleRemoveFromWishlist(product._id);
            setAlert({
                show: true,
                message: 'Product moved to cart',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to move product to cart',
                type: 'danger'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-container">
            <h4 className="mb-4">My Wishlist ({wishlistItems.length})</h4>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-heart fs-1 text-muted"></i>
                    <p className="mt-3">Your wishlist is empty</p>
                    <Link to="/products" className="btn btn-primary mt-2">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div className="row g-4">
                    {wishlistItems.map((item) => (
                        <div key={item._id} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100">
                                <img 
                                    src={`https://uzer-server.onrender.com${item.images[0]?.path}`} 
                                    className="card-img-top wishlist-img" 
                                    alt={item.name}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{item.name}</h5>
                                    <p className="card-text text-muted">
                                        ${item.price.toFixed(2)}
                                    </p>
                                    <div className="d-flex justify-content-between">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleMoveToCart(item)}
                                        >
                                            Move to Cart
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleRemoveFromWishlist(item._id)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;