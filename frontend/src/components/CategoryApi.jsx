import apiInstance from '../axios/axio';

export const CategoryApi = {
    getCategories: async () => {
        try {
            const response = await apiInstance.get('/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createCategory: async (categoryData) => {
        try {
            const response = await apiInstance.post('/categories', categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const response = await apiInstance.put(`/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await apiInstance.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // Brand methods
    getBrands: async () => {
        try {
            const response = await apiInstance.get('/brands');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createBrand: async (brandData) => {
        try {
            const response = await apiInstance.post('/brands', brandData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateBrand: async (id, brandData) => {
        try {
            const response = await apiInstance.put(`/brands/${id}`, brandData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteBrand: async (id) => {
        try {
            const response = await apiInstance.delete(`/brands/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};