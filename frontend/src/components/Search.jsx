import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductApi } from './ProductApi';
import { Link } from 'react-router-dom';
import { BiFilter } from 'react-icons/bi';

const Search = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: ''
    });

    const query = searchParams.get('q') || '';

    useEffect(() => {
        const fetchSearchResults = async () => {
            setIsLoading(true);
            try {
                const response = await ProductApi.searchProducts(query, filters);
                setProducts(response.products || []);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to fetch search results');
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (query) {
            fetchSearchResults();
        }
    }, [query, filters]);

    return (
        <div className="container mt-5 pt-5">
            <div className="row mb-4">
                <div className="col">
                    <h2>Search Results for "{query}"</h2>
                    {products.length > 0 && (
                        <p className="text-muted">{products.length} products found</p>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-3">
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title d-flex align-items-center">
                                    <BiFilter className="me-2" /> Filters
                                </h5>
                                <div className="mb-3">
                                    <label className="form-label">Price Range</label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters(prev => ({
                                                ...prev,
                                                minPrice: e.target.value
                                            }))}
                                        />
                                        <input
                                            type="number"
                                            className="form-control"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters(prev => ({
                                                ...prev,
                                                maxPrice: e.target.value
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-9">
                        {products.length === 0 ? (
                            <div className="text-center py-5">
                                <h3>No products found</h3>
                                <p className="text-muted">Try adjusting your search criteria</p>
                            </div>
                        ) : (
                            <div className="row row-cols-1 row-cols-md-3 g-4">
                                {products.map((product) => (
                                    <div key={product._id} className="col">
                                        <Link 
                                            to={`/product/${product._id}`}
                                            className="text-decoration-none"
                                        >
                                            <div className="card h-100">
                                                <img
                                                    src={product.images[0]?.path || '/placeholder.jpg'}
                                                    className="card-img-top"
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/placeholder.jpg';
                                                    }}
                                                />
                                                <div className="card-body">
                                                    <h5 className="card-title">{product.name}</h5>
                                                    <p className="card-text text-muted">
                                                        {product.description.substring(0, 100)}...
                                                    </p>
                                                    <p className="card-text fw-bold">
                                                        ₹{product.price.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Search;