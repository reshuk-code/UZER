import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OrderApi } from './OrderApi';
import { toast } from 'react-toastify';
import './OrderSuccess.css';


const OrderSuccess = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                setLoading(true);
                const response = await OrderApi.getOrderById(orderId);
                
                if (response.success) {
                    setOrder(response.order);
                    setError(null);
                } else {
                    throw new Error('Failed to fetch order');
                }
            } catch (error) {
                console.error('Failed to fetch order details:', error);
                setError(error.message);
                toast.error(error.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
        localStorage.removeItem('cart');
    }, [orderId]);

    if (loading) {
        return (
            <div className="order-success-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }


    return (
        <div className="order-success-container">
            <motion.div 
                className="success-card"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div 
                    className="success-icon"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                >
                    <i className="bi bi-check-circle-fill"></i>
                </motion.div>
                
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Order Successful!
                </motion.h1>
                
                <motion.div
                    className="order-details"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    {order && (
                        <>
                            <p className="order-number">Order #{order.orderNumber}</p>
                            <p className="amount">Total Amount: ₹{order.totalAmount.toFixed(2)}</p>
                        </>
                    )}
                    <p className="thank-you">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>
                </motion.div>
                
                <div className="button-group">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Link to={`/order/${orderId}`} className="btn btn-primary">
                            View Orders
                        </Link>
                    </motion.div>
                    
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1 }}
                    >
                        <Link to="/products" className="btn btn-outline-primary">
                            Continue Shopping
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;