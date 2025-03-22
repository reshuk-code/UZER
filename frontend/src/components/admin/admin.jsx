import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductManagement from '../ProductManagement';
import OrderManagement from '../OrderManagement';
import CategoryManagement from '../CategoryManagement';
import { UserApi } from '../User/UserApi/UserApi';
import './css/admin.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const isAdmin = await UserApi.isAdmin();
                if (!isAdmin) {
                    navigate('/');
                    return;
                }
                fetchDashboardStats();
            } catch (error) {
                console.error('Admin check failed:', error);
                navigate('/');
            }
        };

        checkAdmin();
    }, [navigate]);

    const fetchDashboardStats = async () => {
        try {
            setIsLoading(true);
            const response = await UserApi.getDashboardStats();
            setStats({
                totalUsers: response.totalUsers || 0,
                totalOrders: response.totalOrders || 0,
                totalProducts: response.totalProducts || 0,
                totalRevenue: response.totalRevenue || 0
            });
        } catch (error) {
            setError('Failed to load dashboard statistics');
            console.error('Dashboard stats error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="d-flex justify-content-center p-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            );
        }

        switch (activeTab) {
            case 'overview':
                return (
                    <div className="row g-4">
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body">
                                    <h5 className="card-title">Total Users</h5>
                                    <h2 className="card-text">{stats.totalUsers}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body">
                                    <h5 className="card-title">Total Orders</h5>
                                    <h2 className="card-text">{stats.totalOrders}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body">
                                    <h5 className="card-title">Total Products</h5>
                                    <h2 className="card-text">{stats.totalProducts}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card stat-card">
                                <div className="card-body">
                                    <h5 className="card-title">Total Revenue</h5>
                                    <h2 className="card-text">${stats.totalRevenue.toFixed(2)}</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                case 'products':
                    return <ProductManagement />;
                case 'orders':
                    return <OrderManagement />;
                case 'categories':
                    return <CategoryManagement />;
            default:
                return null;
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-2 sidebar">
                        <h4 className="sidebar-header">Admin Panel</h4>
                        <div className="list-group">
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                <i className="bi bi-graph-up me-2"></i>
                                Overview
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'products' ? 'active' : ''}`}
                                onClick={() => setActiveTab('products')}
                            >
                                <i className="bi bi-box me-2"></i>
                                Products
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <i className="bi bi-cart me-2"></i>
                                Orders
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'categories' ? 'active' : ''}`}
                                onClick={() => setActiveTab('categories')}
                            >
                                <i className="bi bi-tags me-2"></i>
                                Categories & Brands
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                                onClick={() => setActiveTab('users')}
                            >
                                <i className="bi bi-people me-2"></i>
                                Users
                            </button>
                            <button
                                className={`list-group-item list-group-item-action ${activeTab === 'settings' ? 'active' : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                <i className="bi bi-gear me-2"></i>
                                Settings
                            </button>
                        </div>
                    </div>
                    <div className="col-md-10 main-content">
                        <div className="content-header d-flex justify-content-between align-items-center mb-4">
                            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                            <button 
                                className="btn btn-primary" 
                                onClick={fetchDashboardStats}
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Refresh
                            </button>
                        </div>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;