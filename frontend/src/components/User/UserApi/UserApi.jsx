import apiInstance from '../../../axios/axio';

const BACKEND_URL = 'http://localhost:3000';

const transformReviewMedia = (review) => {
    if (!review) return null;

    return {
        ...review,
        images: Array.isArray(review.images) 
            ? review.images.map(img => ({
                ...img,
                path: img.path?.startsWith('http') 
                    ? img.path 
                    : `${BACKEND_URL}${img.path}`
            }))
            : [],
        videos: Array.isArray(review.videos)
            ? review.videos.map(video => ({
                ...video,
                path: video.path?.startsWith('http')
                    ? video.path
                    : `${BACKEND_URL}${video.path}`
            }))
            : []
    };
};

export const UserApi = {
    // Login user
    login: async (credentials) => {
        try {
            const response = await apiInstance.post('/users/login', credentials);
            
            if (response.data.isVerified === false) {
                throw new Error('Please verify your email first. Check your inbox for verification link.');
            }

            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    verifyEmail: async (data) => {
        try {
            const response = await apiInstance.post('/users/verify-email', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    resendVerification: async (email) => {
        try {
            const response = await apiInstance.post('/users/resend-verification', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // Register new user
    register: async (userData) => {
        try {
            const response = await apiInstance.post('/users/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getProfile: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiInstance.get('/users/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateProfile: async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await apiInstance.put('/users/profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Request password reset
    forgotPassword: async (email) => {
        try {
            const response = await apiInstance.post('/users/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Password reset request failed' };
        }
    },

    // Reset password with token
    resetPassword: async (token, newPassword) => {
        try {
            const response = await apiInstance.put(`/users/reset-password/${token}`, {
                password: newPassword
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Password reset failed' };
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Get current user data
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is admin
    isAdmin: () => {
        const user = UserApi.getCurrentUser();
        return user?.isAdmin || false;
    },
    getDashboardStats: async () => {
        try {
            const response = await apiInstance.get('/admin/dashboard/stats');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Admin User Management
    getAllUsers: async (params = {}) => {
        try {
            const response = await apiInstance.get('/admin/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            const response = await apiInstance.patch(`/admin/users/${userId}/role`, { role });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    // User Order Management 
    getUserOrders: async () => {
        try {
            const response = await apiInstance.get('/orders/myorders');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch your orders' };
        }
    },
    
    // Admin Order Management
    getOrders: async () => {
        try {
            const response = await apiInstance.get('/orders');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch orders' };
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await apiInstance.put(`/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update order status' };
        }
    },
    getAllOrders: async (params = {}) => {
        try {
            const response = await apiInstance.get('/admin/orders', { 
                params,
                headers: { 'Cache-Control': 'no-cache' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getOrderDetails: async (orderId) => {
        try {
            const response = await apiInstance.get(`/admin/orders/${orderId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },


    // Admin Product Management
    getAllProducts: async (params = {}) => {
        try {
            const response = await apiInstance.get('/admin/products', { 
                params,
                headers: { 'Cache-Control': 'no-cache' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getProductDetails: async (productId) => {
        try {
            const response = await apiInstance.get(`/products/${productId}`);
            console.log('Raw API response:', response); // Debug log
            
            if (!response.data) {
                throw new Error('No data received from API');
            }
            
            return {
                data: response.data,
                success: true
            };
        } catch (error) {
            console.error('API Error:', error);
            throw error.response?.data || { 
                message: 'Failed to fetch product details',
                success: false 
            };
        }
    },
    getProductReviews: async (productId) => {
        try {
            const response = await apiInstance.get(`/products/${productId}/reviews`);
            
            // Transform reviews to include full URLs
            const transformedReviews = response.data.reviews?.map(transformReviewMedia) || [];

            return {
                reviews: transformedReviews,
                success: true
            };
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
        }
    },

    addProductReview: async (productId, formData) => {
        try {
            const response = await apiInstance.post(
                `/products/${productId}/reviews`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Transform the new review to include full URLs
            const transformedReview = transformReviewMedia(response.data.review);

            return {
                success: true,
                review: transformedReview
            };
        } catch (error) {
            console.error('Failed to add review:', error);
            throw new Error(error.response?.data?.message || 'Failed to add review');
        }
    },

    updateProductReview: async (productId, reviewId, formData) => {
        try {
            const response = await apiInstance.put(
                `/products/${productId}/reviews/${reviewId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Transform the updated review to include full URLs
            const transformedReview = transformReviewMedia(response.data.review);

            return {
                success: true,
                review: transformedReview
            };
        } catch (error) {
            console.error('Failed to update review:', error);
            throw new Error(error.response?.data?.message || 'Failed to update review');
        }
    },
    deleteProductReview: async (productId, reviewId) => {
        try {
            const response = await apiInstance.delete(
                `/products/${productId}/reviews/${reviewId}`
            );

            return {
                success: true,
                message: response.data.message || 'Review deleted successfully'
            };
        } catch (error) {
            console.error('Failed to delete review:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete review');
        }
    },

    deleteReviewMedia: async (productId, reviewId, mediaId, mediaType) => {
        try {
            const response = await apiInstance.delete(
                `/products/${productId}/reviews/${reviewId}/media/${mediaId}`,
                {
                    params: { mediaType }
                }
            );

            return {
                success: true,
                message: response.data.message || 'Media deleted successfully'
            };
        } catch (error) {
            console.error('Failed to delete media:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete media');
        }
    },
    // Admin Category Management
    getAllCategories: async () => {
        try {
            const response = await apiInstance.get('/admin/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getCategoryDetails: async (categoryId) => {
        try {
            const response = await apiInstance.get(`/admin/categories/${categoryId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
   
    // Admin Brand Management
    getAllBrands: async () => {
        try {
            const response = await apiInstance.get('/admin/brands');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getBrandDetails: async (brandId) => {
        try {
            const response = await apiInstance.get(`/admin/brands/${brandId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Admin Statistics and Reports
    getSalesReport: async (params = {}) => {
        try {
            const response = await apiInstance.get('/admin/reports/sales', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getInventoryReport: async () => {
        try {
            const response = await apiInstance.get('/admin/reports/inventory');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getRevenueStats: async (period = 'monthly') => {
        try {
            const response = await apiInstance.get(`/admin/stats/revenue?period=${period}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getAddresses: async () => {
        try {
            const response = await apiInstance.get('/addresses');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch addresses' };
        }
    },

    addAddress: async (addressData) => {
        try {
            const response = await apiInstance.post('/addresses', addressData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add address' };
        }
    },

    updateAddress: async (addressId, addressData) => {
        try {
            const response = await apiInstance.put(`/addresses/${addressId}`, addressData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update address' };
        }
    },
 
    deleteAddress: async (addressId) => {
        try {
            const response = await apiInstance.delete(`/addresses/${addressId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to delete address' };
        }
    },

    setDefaultAddress: async (addressId) => {
        try {
            const response = await apiInstance.patch(`/addresses/${addressId}/set-default`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to set default address' };
        }
    },
    getWishlist: async () => {
        try {
            const response = await apiInstance.get('/wishlist');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch wishlist' };
        }
    },

    addToWishlist: async (productId) => {
        try {
            const response = await apiInstance.post('/wishlist', { productId });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add to wishlist' };
        }
    },

    removeFromWishlist: async (productId) => {
        try {
            const response = await apiInstance.delete(`/wishlist/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to remove from wishlist' };
        }
    },
};

export default UserApi;