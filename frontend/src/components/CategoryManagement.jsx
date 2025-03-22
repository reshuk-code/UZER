import React, { useState, useEffect } from 'react';
import { CategoryApi } from './CategoryApi';
import './CategoryManagement.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [activeTab, setActiveTab] = useState('categories');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null
    });
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            if (activeTab === 'categories') {
                const response = await CategoryApi.getCategories();
                // Make sure we're setting the array correctly
                setCategories(Array.isArray(response) ? response : response?.categories || []);
            } else {
                const response = await CategoryApi.getBrands();
                // Make sure we're setting the array correctly
                setBrands(Array.isArray(response) ? response : response?.brands || []);
            }
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to fetch data',
                type: 'danger'
            });
            // Set empty arrays on error
            if (activeTab === 'categories') {
                setCategories([]);
            } else {
                setBrands([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            if (selectedItem) {
                if (activeTab === 'categories') {
                    await CategoryApi.updateCategory(selectedItem._id, formDataToSend);
                } else {
                    await CategoryApi.updateBrand(selectedItem._id, formDataToSend);
                }
            } else {
                if (activeTab === 'categories') {
                    await CategoryApi.createCategory(formDataToSend);
                } else {
                    await CategoryApi.createBrand(formDataToSend);
                }
            }

            setAlert({
                show: true,
                message: `${activeTab === 'categories' ? 'Category' : 'Brand'} ${selectedItem ? 'updated' : 'created'} successfully!`,
                type: 'success'
            });
            setIsModalOpen(false);
            setFormData({ name: '', description: '', image: null });
            fetchData();
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
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        setIsLoading(true);
        try {
            if (activeTab === 'categories') {
                await CategoryApi.deleteCategory(id);
            } else {
                await CategoryApi.deleteBrand(id);
            }
            fetchData();
            setAlert({
                show: true,
                message: `${activeTab === 'categories' ? 'Category' : 'Brand'} deleted successfully!`,
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

    const handleEdit = (item) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            image: null
        });
        setIsModalOpen(true);
    };

    return (
        <div className="category-management p-4">
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
                        <ul className="nav nav-pills">
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('categories')}
                                >
                                    Categories
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link ${activeTab === 'brands' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('brands')}
                                >
                                    Brands
                                </button>
                            </li>
                        </ul>
                        <button 
                            className="btn btn-primary"
                            onClick={() => {
                                setSelectedItem(null);
                                setFormData({ name: '', description: '', image: null });
                                setIsModalOpen(true);
                            }}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add New {activeTab === 'categories' ? 'Category' : 'Brand'}
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Items Count</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (activeTab === 'categories' ? categories : brands || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            No {activeTab} found
                                        </td>
                                    </tr>
                                ) : (
                                    (activeTab === 'categories' ? categories : brands).map((item) => (
                                        <tr key={item?._id || item?.name}>
                                            <td>{item?.name}</td>
                                            <td>{item?.description || '-'}</td>
                                            <td>{item?.itemsCount || 0}</td>
                                            <td>
                                                <div className="btn-group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(item._id)}
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
                    <div className="modal-dialog" onClick={e => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {selectedItem ? 'Edit' : 'Add New'} {activeTab === 'categories' ? 'Category' : 'Brand'}
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
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">Name</label>
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
                                    <div className="mb-3">
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
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="image" className="form-label">Image</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            id="image"
                                            accept="image/*"
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                image: e.target.files[0]
                                            }))}
                                            disabled={isLoading}
                                        />
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
                                            ) : selectedItem ? 'Update' : 'Create'}
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

export default CategoryManagement;