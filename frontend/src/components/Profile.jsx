import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserApi } from './User/UserApi/UserApi';
import './css/profile.css';
import RenderActiveTab from './User/UserComponents/RenderActiveTab';
const Profile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        profilePicture: null,
        addresses: []
    });

    useEffect(() => {
        const checkAuthAndFetchProfile = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (!token || !userData) {
                navigate('/login');
                return;
            }

            try {
                setUser(JSON.parse(userData)); // Set initial user data from localStorage
                await fetchUserProfile(); // Then fetch latest data from server
            } catch (error) {
                console.error('Auth check error:', error);
                navigate('/login');
            }
        };

        checkAuthAndFetchProfile();
    }, [navigate]);

    // Update the fetchUserProfile function
const fetchUserProfile = async () => {
    try {
        setIsLoading(true);
        const response = await UserApi.getProfile();
        
        // Remove the success check since it might not be in the response
        if (!response || !response.user) {
            throw new Error('Failed to fetch profile data');
        }

        // Update both user and localStorage
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        setFormData({
            firstName: response.user.firstName || '',
            lastName: response.user.lastName || '',
            email: response.user.email || '',
            phoneNumber: response.user.phoneNumber || '',
            profilePicture: response.user.profilePicture || null,
            addresses: response.user.addresses || []
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        setAlert({
            show: true,
            message: error.message || 'Failed to load profile',
            type: 'danger'
        });
        
        // Only remove storage and redirect if unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    } finally {
        setIsLoading(false);
    }
};

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            setIsLoading(true);
            const response = await UserApi.updateProfile(formData);
            
            if (response.success) {
                await fetchUserProfile();
                setAlert({
                    show: true,
                    message: 'Profile picture updated successfully',
                    type: 'success'
                });
            }
        } catch (error) {
            setAlert({
                show: true,
                message: error.response?.data?.message || 'Failed to update profile picture',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ... rest of your component (return statement) remains the same

    return (
        <div className="container profile-container">
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-3">
                    <div className="card profile-sidebar">
                        <div className="profile-header text-center p-4">
                            <div className="profile-image-container mb-3">
                                <img 
                                    src={user?.profilePicture || '/default-avatar.png'} 
                                    alt="Profile" 
                                    className="rounded-circle profile-image"
                                />
                                {isEditing && (
                                    <label className="image-upload-label">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageUpload} 
                                            hidden 
                                        />
                                        <i className="bi bi-camera"></i>
                                    </label>
                                )}
                            </div>
                            <h5>{user?.firstName} {user?.lastName}</h5>
                            <p className="text-muted">{user?.email}</p>
                        </div>
                        <div className="list-group">
                            <button 
                                className={`list-group-item ${activeTab === 'info' ? 'active' : ''}`}
                                onClick={() => setActiveTab('info')}
                            >
                                <i className="bi bi-person me-2"></i> Personal Info
                            </button>
                            <button 
                                className={`list-group-item ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <i className="bi bi-box me-2"></i> Orders
                            </button>
                            <button 
                                className={`list-group-item ${activeTab === 'addresses' ? 'active' : ''}`}
                                onClick={() => setActiveTab('addresses')}
                            >
                                <i className="bi bi-geo-alt me-2"></i> Addresses
                            </button>
                            <button 
                                className={`list-group-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                                onClick={() => setActiveTab('wishlist')}
                            >
                                <i className="bi bi-heart me-2"></i> Wishlist
                            </button>
                            {user?.isAdmin && (
                                <>
                                    <button 
                                        className={`list-group-item ${activeTab === 'products' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('products')}
                                    >
                                        <i className="bi bi-grid me-2"></i> Manage Products
                                    </button>
                                    <button 
                                        className={`list-group-item ${activeTab === 'categories' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('categories')}
                                    >
                                        <i className="bi bi-tags me-2"></i> Categories & Brands
                                    </button>
                                    <button 
                                        className={`list-group-item ${activeTab === 'allOrders' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('allOrders')}
                                    >
                                        <i className="bi bi-clipboard-data me-2"></i> All Orders
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-md-9">
                    {alert.show && (
                        <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
                            {alert.message}
                            <button type="button" className="btn-close" onClick={() => setAlert({ show: false })}></button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center p-5">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-body">
                                <RenderActiveTab 
                                    activeTab={activeTab} 
                                    user={user} 
                                    formData={formData}
                                    setFormData={setFormData}
                                    isEditing={isEditing}
                                    setIsEditing={setIsEditing}
                                    fetchUserProfile={fetchUserProfile}
                                    setAlert={setAlert}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;