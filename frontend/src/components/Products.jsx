import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BiSearch, BiHeart } from 'react-icons/bi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ProductApi } from './ProductApi';
import { UserApi } from './User/UserApi/UserApi';
import { useCart } from './Cart/CartContext';
import { useWishlist } from './WishlistContext';
import './Products.css';

const Products = () => {
    // 1. State Management
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest'
    });

    // 2. Context Hooks
    const { addToCart } = useCart();
    const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

    // 3. Data Fetching
    useEffect(() => {
      const fetchInitialData = async () => {
          try {
              setLoading(true);
              setError(null);

              // Fetch categories first
              const categoriesRes = await ProductApi.getCategories();
              if (categoriesRes.success) {
                  setCategories(categoriesRes.categories || []);
              }

              // Then fetch products
              const productsRes = await ProductApi.getProducts();
              if (productsRes.success) {
                  setProducts(productsRes.products || []);
              }

          } catch (error) {
              console.error('Failed to fetch initial data:', error);
              setError(error.message || 'Failed to load data');
              toast.error(error.message || 'Failed to load data');
          } finally {
              setLoading(false);
          }
      };

      fetchInitialData();
  }, []);

    // 4. Helper Functions
    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item._id === productId);
    };

    const getFilteredProducts = () => {
        if (!products) return [];
        
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(filters.search.toLowerCase());
            const matchesCategory = !filters.category || product.category?._id === filters.category;
            const matchesPrice = (!filters.minPrice || product.price >= Number(filters.minPrice)) &&
                               (!filters.maxPrice || product.price <= Number(filters.maxPrice));
            return matchesSearch && matchesCategory && matchesPrice;
        }).sort((a, b) => {
            switch (filters.sort) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
    };

    // 5. Event Handlers
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success('Added to cart!');
    };

    const handleWishlist = async (product) => {
        if (!localStorage.getItem('token')) {
            toast.error('Please login to add items to wishlist');
            return;
        }

        try {
            setIsWishlistLoading(true);
            if (isInWishlist(product._id)) {
                await removeFromWishlist(product._id);
                toast.success('Removed from wishlist');
            } else {
                await addToWishlist(product);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update wishlist');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    // 6. Filtered Products
    const finalProducts = getFilteredProducts();

    // 7. Loading State
    if (loading) {
        return (
            <div className="container mt-5 pt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // 8. Error State
    if (error) {
        return (
            <div className="container mt-5 pt-5">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            </div>
        );
    }

    // 9. Main Render
    return (
        <div className="container mt-5 pt-5">
            {/* Filter Section */}
            <div className="row mb-4">
                <div className="col-md-12">
                    <div className="filter-container p-3 bg-light rounded">
                        <div className="row g-3">
                            {/* Search Input */}
                            <div className="col-md-3">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <BiSearch />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search products..."
                                        name="search"
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                    disabled={loading || categories.length === 0}
                                >
                                    <option value="">All Categories</option>
                                    {categories && categories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Filters */}
                            <div className="col-md-2">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Min Price"
                                    name="minPrice"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-md-2">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Max Price"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            {/* Sort Filter */}
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    name="sort"
                                    value={filters.sort}
                                    onChange={handleFilterChange}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="row">
                {finalProducts.length === 0 ? (
                    <div className="col-12 text-center">
                        <p>No products found.</p>
                    </div>
                ) : (
                    finalProducts.map((product) => (
                        <div key={product._id} className="col-md-3 mb-4">
                            <div className="card h-100 product-card">
                                <Link 
                                    to={`/products/${product._id}`}
                                    className="product-link"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <div className="position-relative">
                                        <img
                                            src={"https://uzer-server.onrender.com"+product.images[0]?.path || '/placeholder.jpg'}
                                            className="card-img-top"
                                            alt={product.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder.jpg';
                                            }}
                                        />
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">{product.name}</h5>
                                        <p className="card-text text-truncate">{product.description}</p>
                                        <div className="price">₹{product.price.toFixed(2)}</div>
                                    </div>
                                </Link>
                                <div className="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
                                    <button 
                                        className={`wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleWishlist(product);
                                        }}
                                        disabled={isWishlistLoading}
                                        aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                    >
                                        {isInWishlist(product._id) ? <FaHeart /> : <BiHeart />}
                                    </button>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleAddToCart(product);
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Products;