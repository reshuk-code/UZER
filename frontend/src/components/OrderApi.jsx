
import axiosInstance from '../axios/axio';
const BASE_URL = 'https://uzer-server.onrender.com/api';

const transformOrderData = (order) => {
    if (!order) return null;

    // Transform order items to include full image URLs
    const transformedItems = order.orderItems.map(item => ({
        ...item,
        product: {
            ...item.product,
            images: item.product.images?.map(img => ({
                ...img,
                path: img.path?.startsWith('http') ? img.path : `${BASE_URL}${img.path}`
            })) || []
        }
    }));

    return {
        ...order,
        orderItems: transformedItems
    };
};

export const OrderApi = {
    createOrder: async (orderData) => {
        try {
            // Transform the order data to match backend expectations
            const transformedData = {
                items: orderData.items,
                shippingAddress: {
                    _id: orderData.shippingAddress,
                    // Add other required address fields that will be populated from backend
                },
                paymentMethod: orderData.paymentMethod === 'COD' ? 'CASH_ON_DELIVERY' : 'ONLINE',
                totalAmount: orderData.items.reduce((total, item) => {
                    return total + (item.price * item.quantity);
                }, 0)
            };

            const response = await axiosInstance.post('/orders', transformedData);
            return response.data;
        } catch (error) {
            console.error('Order creation error:', error);
            throw error.response?.data || {
                message: 'Failed to create order',
                error: error.message
            };
        }
    },
    
    // Add other order-related methods
    getOrders: async () => {
        try {
            const response = await axiosInstance.get('/orders');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch orders' };
        }
    },

    getOrderById: async (orderId) => {
        try {
            console.log('Fetching order:', orderId); // Debug log
            const response = await axiosInstance.get(`/orders/${orderId}`);
            console.log('Order response:', response.data); // Debug log

            if (!response.data || !response.data.order) {
                throw new Error('Invalid order data received');
            }

            return {
                order: response.data.order,
                success: true
            };
        } catch (error) {
            console.error('Failed to fetch order:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch order details');
        }
    },

    getOrderDetails: async (orderId) => {
        try {
            const response = await axiosInstance.get(`/orders/${orderId}`);
            console.log('Raw API response:', response.data);

            if (!response.data || !response.data._id) {
                throw new Error('Invalid order data received');
            }

            // Transform the order data to include full image URLs
            const transformedOrder = transformOrderData(response.data);

            return {
                order: transformedOrder,
                success: true
            };
        } catch (error) {
            console.error('OrderApi error:', error);
            throw {
                message: error.response?.data?.message || 'Failed to fetch order details',
                success: false
            };
        }
    },
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await axiosInstance.put(`/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Status update failed');
        }
    },

    // Cancel order (user)
    cancelOrder: async (orderId) => {
        try {
            const response = await axiosInstance.post(`/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to cancel order' };
        }
    },

    
    updatePaymentStatus: async (orderId, paymentData) => {
        try {
            const response = await axiosInstance.post(`/orders/${orderId}/payment`, {
                orderId,
                paymentMethod: paymentData.paymentMethod,
                paymentDetails: {
                    accountNumber: paymentData.paymentDetails.accountNumber,
                    bankName: paymentData.paymentDetails.bankName,
                    holderName: paymentData.paymentDetails.holderName,
                    esewaId: paymentData.paymentDetails.esewaId,
                    paymentDate: new Date().toISOString()
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message);
            }

            return response.data;
        } catch (error) {
            console.error('Payment status update error:', error);
            throw new Error(error.response?.data?.message || 'Payment status update failed');
        }
    },
    updateStock: async (orderId) => {
        try {
            const response = await axiosInstance.post(`/orders/${orderId}/stock`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Stock update failed');
        }
    }
};