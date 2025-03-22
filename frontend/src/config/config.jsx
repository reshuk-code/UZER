export const API_ENDPOINTS = {
    PRODUCTS: {
        LIST: '/products',
        SEARCH: '/products/search',
        DETAILS: (id) => `/api/products/${id}`,
        CREATE: '/products',
        UPDATE: (id) => `/products/${id}`,
        DELETE: (id) => `/products/${id}`,
        UPDATE_MAIN_IMAGE: (id) => `/products/${id}/main-image`
    },
    CATEGORIES: {
        LIST: '/categories',
        SEARCH: '/categories/search',
        DETAILS: (id) => `/categories/${id}`,
        CREATE: '/categories',
        UPDATE: (id) => `/api/categories/${id}`,
        DELETE: (id) => `/api/categories/${id}`
    },
    BRANDS: {
        LIST: '/api/brands',
        SEARCH: '/api/brands/search',
        DETAILS: (id) => `/api/brands/${id}`,
        CREATE: '/api/brands',
        UPDATE: (id) => `/api/brands/${id}`,
        DELETE: (id) => `/api/brands/${id}`
    },
    ORDERS: {
        LIST: '/orders',
        MY_ORDERS: '/api/orders/myorders',
        DETAILS: (id) => `/api/orders/${id}`,
        CREATE: '/api/orders',
        UPDATE_STATUS: (id) => `/api/orders/${id}/status`,
        UPDATE_PAYMENT: (id) => `/api/orders/${id}/pay`
    },
    REVIEWS: {
        LIST: (productId) => `/api/products/${productId}/reviews`,
        CREATE: (productId) => `/api/products/${productId}/reviews`,
        UPDATE: (productId, reviewId) => `/api/products/${productId}/reviews/${reviewId}`,
        DELETE: (productId, reviewId) => `/api/products/${productId}/reviews/${reviewId}`,
        MEDIA: {
            ADD: (productId, reviewId) => `/api/products/${productId}/reviews/${reviewId}/media`,
            DELETE: (productId, reviewId, mediaId) => 
                `/api/products/${productId}/reviews/${reviewId}/media/${mediaId}`
        }
    }
};