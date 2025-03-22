import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance with custom config
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});



// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.status, response.data); // Debug log
        return response;
    },
    (error) => {
        console.error('Response error:', error.response || error);
        return Promise.reject(error);
    }
);

// Auth related API calls
export const authAPI = {
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post('/users/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    register: async (userData) => {
        try {
            const response = await axiosInstance.post('/users/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    forgotPassword: async (email) => {
        try {
            const response = await axiosInstance.post('/users/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    resetPassword: async (token, newPassword) => {
        try {
            const response = await axiosInstance.put(`/users/reset-password/${token}`, { 
                password: newPassword 
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    getProfile: async () => {
        try {
            const response = await axiosInstance.get('/users/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch profile' };
        }
    },

    updateProfile: async (formData) => {
        try {
            const response = await axiosInstance.put('/users/profile', formData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to update profile' };
        }
    }
};
export const OrderApi = {
    createOrder: async (orderData) => {
        try {
            const response = await apiInstance.post('/orders', orderData);
            return response.data;
        } catch (error) {
            if (error.response?.data) {
                throw error.response.data;
            }
            throw error;
        }
    }
};
// Product related API calls
export const productAPI = {
    getAll: async (page = 1) => {
        try {
            const response = await axiosInstance.get(`/products?page=${page}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/products/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    search: async (keyword) => {
        try {
            const response = await axiosInstance.get(`/products/search?keyword=${encodeURIComponent(keyword)}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

// Cart related API calls
export const cartAPI = {
    get: async () => {
        try {
            const response = await axiosInstance.get('/cart');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    add: async (productId, quantity) => {
        try {
            const response = await axiosInstance.post('/cart', { productId, quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    update: async (productId, quantity) => {
        try {
            const response = await axiosInstance.put(`/cart/${productId}`, { quantity });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    remove: async (productId) => {
        try {
            const response = await axiosInstance.delete(`/cart/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    clear: async () => {
        try {
            const response = await axiosInstance.delete('/cart');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default axiosInstance;