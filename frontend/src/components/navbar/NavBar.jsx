import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BiUser, BiCart, BiSearch, BiHeart, BiLogOut, BiMenu } from 'react-icons/bi';
import { ProductApi } from '../ProductApi';
import { useCart } from '../Cart/CartContext';
import { useWishlist } from '../WishlistContext';
import './NavBar.css';

const NavBar = () => {
    const { items } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const searchRef = useRef(null);
    const { wishlistItems } = useWishlist();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle user data
    useEffect(() => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                if (parsedUser && parsedUser._id) {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem('user');
                }
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
        }
    }, []);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle login event
    useEffect(() => {
        const handleLogin = (event) => {
            if (event.detail && event.detail.user) {
                setUser(event.detail.user);
            }
        };

        window.addEventListener('userLogin', handleLogin);
        return () => window.removeEventListener('userLogin', handleLogin);
    }, []);

    const handleLogout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberMe');
            setUser(null);
            setShowProfileMenu(false);
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };
    const handleSearchInput = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.trim().length >= 2) {
            setIsSearching(true);
            // Debounce search
            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await ProductApi.searchProducts(query);
                    setSearchResults(response.products || []);
                } catch (error) {
                    console.error('Search error:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
        } else {
            setSearchResults([]);
        }
    };
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const renderUserSection = () => {
        if (user) {
            return (
                <div className="profile-dropdown" ref={menuRef}>
                    <button 
                        className="profile-btn"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        aria-label="User menu"
                    >
                        <div className="profile-avatar">
                            {user.profilePicture ? (
                                <img 
                                    src={user.profilePicture} 
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="profile-image"
                                />
                            ) : (
                                <>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</>
                            )}
                        </div>
                    </button>
                    {showProfileMenu && (
                        <div className="profile-menu">
                            <div className="profile-header">
                                <p className="profile-name">{user.firstName} {user.lastName}</p>
                                <p className="profile-email">{user.email}</p>
                            </div>
                            <Link to="/profile" className="profile-menu-item">
                                <BiUser /> Profile
                            </Link>
                            {user.isAdmin && (
                                <Link to="/admin" className="profile-menu-item">
                                    <BiUser /> Admin Dashboard
                                </Link>
                            )}
                            <button 
                                onClick={handleLogout} 
                                className="profile-menu-item logout"
                                aria-label="Logout"
                            >
                                <BiLogOut /> Logout
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link to="/login" className="icon-btn" aria-label="Login">
                <BiUser size={20} />
            </Link>
        );
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="nav-brand">
                <button 
                    className="menu-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <BiMenu size={24} />
                </button>
                <Link to="/" className="brand">URZER</Link>
            </div>

            <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>
               
            </div>

            <div className="nav-icons">
            <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="search"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={handleSearchInput}
                        className="search-input"
                        ref={searchRef}
                    />
                    <button type="submit" className="icon-btn" aria-label="Search">
                        <BiSearch size={20} />
                    </button>
                </form>
                
                {/* Search Results Dropdown */}
                {(searchResults.length > 0 || isSearching) && searchQuery.trim() && (
                    <div className="search-results">
                        {isSearching ? (
                            <div className="search-loading">
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {searchResults.map((product) => (
                                    <Link
                                        key={product._id}
                                        to={`/products/${product._id}`}
                                        className="search-result-item"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSearchResults([]);
                                        }}
                                    >
                                        <img
                                            src={product.images[0]?.path || '/placeholder.jpg'}
                                            alt={product.name}
                                            className="search-result-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder.jpg';
                                            }}
                                        />
                                        <div className="search-result-info">
                                            <h6>{product.name}</h6>
                                            <p>₹{product.price.toFixed(2)}</p>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
                <BiHeart size={20} />
                {wishlistItems.length > 0 && (
                    <span className="badge">{wishlistItems.length}</span>
                )}
            </Link>
                
                <Link to="/cart" className="icon-btn" aria-label="Cart">
                    <BiCart size={20} />
                    {items.length > 0 && (
                        <span className="badge">{items.length}</span>
                    )}
                </Link>
                
                {renderUserSection()}
            </div>
        </nav>
    );
};

export default NavBar;