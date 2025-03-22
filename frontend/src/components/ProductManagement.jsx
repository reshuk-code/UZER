import React, { useState, useEffect } from 'react';
import { ProductApi } from './ProductApi';
import { CategoryApi } from './CategoryApi';
import './ProductManagement.css';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        images: [],
        specifications: []
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await ProductApi.getProducts();
            setProducts(response.products);
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to fetch products',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await CategoryApi.getCategories();
            // Handle both array response and object with categories property
            setCategories(Array.isArray(response) ? response : response?.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            setAlert({
                show: true,
                message: 'Failed to load categories',
                type: 'danger'
            });
            setCategories([]);
        }
    };
    

    const fetchBrands = async () => {
        try {
            const response = await CategoryApi.getBrands();
            // Handle both array response and object with brands property
            setBrands(Array.isArray(response) ? response : response?.brands || []);
        } catch (error) {
            console.error('Failed to fetch brands:', error);
            setAlert({
                show: true,
                message: 'Failed to load brands',
                type: 'danger'
            });
            setBrands([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'images') {
                    formData[key].forEach(image => {
                        formDataToSend.append('images', image);
                    });
                } else if (key === 'specifications') {
                    formDataToSend.append('specifications', JSON.stringify(formData[key]));
                } else if (formData[key] !== null && formData[key] !== '') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (selectedProduct) {
                await ProductApi.updateProduct(selectedProduct._id, formDataToSend);
                setAlert({
                    show: true,
                    message: 'Product updated successfully!',
                    type: 'success'
                });
            } else {
                await ProductApi.createProduct(formDataToSend);
                setAlert({
                    show: true,
                    message: 'Product created successfully!',
                    type: 'success'
                });
            }

            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Operation failed',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        setIsLoading(true);
        try {
            await ProductApi.deleteProduct(id);
            fetchProducts();
            setAlert({
                show: true,
                message: 'Product deleted successfully!',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Delete operation failed',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category?._id || '',
            brand: product.brand?._id || '',
            images: [],
            specifications: product.specifications || []
        });
        setIsModalOpen(true);
    };

    const addSpecification = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { key: '', value: '' }]
        }));
    };

    const updateSpecification = (index, field, value) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index][field] = value;
        setFormData(prev => ({
            ...prev,
            specifications: newSpecs
        }));
    };

    const removeSpecification = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="product-management p-4">
            {alert.show && (
                <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`}>
                    {alert.message}
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setAlert({ show: false })}
                    />
                </div>
            )}

            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">Product Management</h3>
                        <button 
                            className="btn btn-primary"
                            onClick={() => {
                                setSelectedProduct(null);
                                setFormData({
                                    name: '',
                                    description: '',
                                    price: '',
                                    stock: '',
                                    category: '',
                                    brand: '',
                                    images: [],
                                    specifications: []
                                });
                                setIsModalOpen(true);
                            }}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add New Product
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Brand</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product._id}>
    <td>
        <img 
            src={product.images[0]?.path || '/placeholder.jpg'}
            alt={product.name}
            className="product-thumbnail"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder.jpg';
            }}
        />
    </td>
    <td>{product.name}</td>
    <td>{product.category?.name || 'No Category'}</td>
    <td>{product.brand?.name || 'No Brand'}</td>
    <td>RS {product.price.toFixed(2)}</td>
    <td>{product.stock}</td>
    <td>
        <div className="btn-group">
            <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleEdit(product)}
            >
                <i className="bi bi-pencil"></i>
            </button>
            <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(product._id)}
                disabled={isLoading}
            >
                <i className="bi bi-trash"></i>
            </button>
        </div>
    </td>
</tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => !isLoading && setIsModalOpen(false)}>
                    <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedProduct ? 'Edit Product' : 'Add New Product'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => !isLoading && setIsModalOpen(false)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label htmlFor="name" className="form-label">Product Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    name: e.target.value
                                                }))}
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="price" className="form-label">Price</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="price"
                                                value={formData.price}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    price: e.target.value
                                                }))}
                                                required
                                                min="0"
                                                step="0.01"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label htmlFor="stock" className="form-label">Stock</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                id="stock"
                                                value={formData.stock}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    stock: e.target.value
                                                }))}
                                                required
                                                min="0"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="category" className="form-label">Category</label>
                                            <select
    className="form-select"
    id="category"
    value={formData.category}
    onChange={(e) => setFormData(prev => ({
        ...prev,
        category: e.target.value
    }))}
    required
    disabled={isLoading}
>
    <option value="">Select Category</option>
    {(categories || []).map(category => (
        <option key={category._id} value={category._id}>
            {category.name}
        </option>
    ))}
</select>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="brand" className="form-label">Brand</label>
                                            <select
    className="form-select"
    id="brand"
    value={formData.brand}
    onChange={(e) => setFormData(prev => ({
        ...prev,
        brand: e.target.value
    }))}
    required
    disabled={isLoading}
>
    <option value="">Select Brand</option>
    {(brands || []).map(brand => (
        <option key={brand._id} value={brand._id}>
            {brand.name}
        </option>
    ))}
</select>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="description" className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    description: e.target.value
                                                }))}
                                                rows="3"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="images" className="form-label">Images</label>
                                            <input
                                                type="file"
                                                className="form-control"
                                                id="images"
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    images: Array.from(e.target.files)
                                                }))}
                                                multiple
                                                accept="image/*"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label className="form-label m-0">Specifications</label>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={addSpecification}
                                                    disabled={isLoading}
                                                >
                                                    <i className="bi bi-plus-lg"></i> Add Specification
                                                </button>
                                            </div>
                                            {formData.specifications.map((spec, index) => (
                                                <div key={index} className="row g-2 mb-2">
                                                    <div className="col-5">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Key"
                                                            value={spec.key}
                                                            onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                    <div className="col-6">
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Value"
                                                            value={spec.value}
                                                            onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                    <div className="col-1">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => removeSpecification(index)}
                                                            disabled={isLoading}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => !isLoading && setIsModalOpen(false)}
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Saving...
                                                </>
                                            ) : selectedProduct ? 'Update Product' : 'Create Product'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;