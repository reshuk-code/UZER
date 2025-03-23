import apiInstance from '../axios/axio';
import { API_ENDPOINTS } from '../config/config';
const BACKEND_URL = 'https://uzer-server.onrender.com/';

const addBackendUrl = (product) => {
    if (!product) return null;
    
    // Return the product directly if it's already in the correct format
    return {
        ...product,
        images: Array.isArray(product.images) 
            ? product.images.map(img => ({
                ...img,
                path: img.path?.startsWith('http') 
                    ? img.path 
                    : `${BACKEND_URL}${img.path}`
            }))
            : []
    };
};
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
export const ProductApi = {
    getProducts: async (params = {}) => {
        try {
            const response = await apiInstance.get('/products', { params });
            console.log('Products API response:', response.data); // Debug log

            if (!response.data || !Array.isArray(response.data.products)) {
                throw new Error('Invalid products data received');
            }

            const transformedProducts = response.data.products
                .map(addBackendUrl)
                .filter(Boolean);

            console.log('Transformed products:', transformedProducts); // Debug log

            return {
                products: transformedProducts,
                success: true,
                total: transformedProducts.length
            };
        } catch (error) {
            console.error('API Error:', error);
            throw {
                message: error.response?.data?.message || 'Failed to fetch products',
                success: false,
                error: error // Include original error for debugging
            };
        }
    },

    searchProducts: async (query, filters = {}) => {
        try {
            const params = { q: query, ...filters };
            const response = await apiInstance.get('/products/search', { params });
            // Transform search results
            response.data.products = response.data.products.map(addBackendUrl);
            return response.data;
        } catch (error) {
            console.error('Search API error:', error);
            throw error.response?.data || { message: 'Failed to search products' };
        }
    },
    deleteProduct: async (productId) => {
        try {
            const response = await apiInstance.delete(`/products/${productId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { 
                message: 'Failed to delete product',
                success: false 
            };
        }
    },
    createProduct: async (productData) => {
        try {
            const response = await apiInstance.post(
                API_ENDPOINTS.PRODUCTS.CREATE,
                productData,
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const response = await apiInstance.put(
                API_ENDPOINTS.PRODUCTS.UPDATE(id),
                productData,
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
    getProductDetails: async (id) => {
        try {
            console.log('Fetching product with ID:', id);
            const response = await apiInstance.get(`/products/${id}`);
            
            const rawProduct = response.data;
            console.log('Raw product data:', rawProduct);

            if (!rawProduct || !rawProduct._id) {
                throw new Error('Product not found');
            }

            // Transform product and its reviews
            const transformedProduct = {
                ...addBackendUrl(rawProduct),
                reviews: rawProduct.reviews?.map(transformReviewMedia) || []
            };

            console.log('Transformed product:', transformedProduct);

            return {
                product: transformedProduct,
                success: true
            };
        } catch (error) {
            console.error('API Error:', error);
            throw {
                message: error.message || 'Failed to fetch product details',
                success: false
            };
        }
    },
    getCategories: async () => {
        try {
            const response = await apiInstance.get('/categories');
            return {
                categories: response.data.categories,
                success: true
            };
        } catch (error) {
            console.error('API Error:', error);
            throw {
                message: error.response?.data?.message || 'Failed to fetch categories',
                success: false
            };
        }
    },
    updateStock: async (productId, data) => {
        try {
            const response = await apiInstance.put(`/products/${productId}/stock`, data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update stock');
        }
    }
};