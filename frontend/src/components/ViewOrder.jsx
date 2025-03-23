import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { OrderApi } from './OrderApi';
import './ViewOrder.css';

const ViewOrder = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                console.log('No orderId provided');
                setError('No order ID provided');
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching order details for:', orderId);
                setLoading(true);
                setError(null);

                const response = await OrderApi.getOrderDetails(orderId);
                console.log('API Response:', response);

                if (response?.success && response?.order) {
                    console.log('Setting order:', response.order);
                    setOrder(response.order);
                } else {
                    console.error('Invalid response structure:', response);
                    throw new Error('Invalid order data received');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                setError(error.message || 'Failed to load order details');
                toast.error(error.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    // Debug logs
    console.log('Current state:', { orderId, loading, error, order });

    // Loading state
    if (loading) {
        return (
            <div className="container mt-5 pt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="container mt-5 pt-5">
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    // No order state with debug info
    if (!order) {
        console.log('No order found in state');
        return (
            <div className="container mt-5 pt-5">
                <div className="alert alert-warning">
                    Order not found (ID: {orderId})
                </div>
            </div>
        );
    }


    return (
        <div className="container mt-5 pt-5">
        <div className="order-details-container">
            <h2>Order Details</h2>
            <div className="order-info mb-4">
                <div className="row">
                    <div className="col-md-6">
                        <p><strong>Order Number:</strong> {order.orderNumber}</p>
                        <p><strong>Order Date:</strong> {format(new Date(order.createdAt), 'PPp')}</p>
                        <p><strong>Status:</strong> <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span></p>
                    </div>
                    <div className="col-md-6">
                        <p><strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}</p>
                        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Payment Status:</strong> <span className={`status-badge ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></p>
                    </div>
                </div>
            </div>

            <div className="shipping-info mb-4">
                <h4>Shipping Information</h4>
                <div className="address-card">
                    <p><strong>{order.shippingAddress.name}</strong></p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}</p>
                    <p>Phone: {order.shippingAddress.phone}</p>
                </div>
            </div>

            <div className="order-items">
                <h4>Order Items</h4>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.orderItems.map((item) => (
                                <tr key={item.product._id}>
                                    <td>
                                        <div className="product-info">
                                            <img 
                                                src={"https://uzer-server.onrender.com"+item.product.images?.[0]?.path || '/placeholder.jpg'} 
                                                alt={item.product.name}
                                                className="product-thumbnail"
                                            />
                                            <div>
                                                <p className="product-name">{item.product.name}</p>
                                                {item.selectedColor && (
                                                    <p className="product-color">
                                                        Color: <span style={{ backgroundColor: item.selectedColor }} className="color-dot"></span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>₹{item.price?.toFixed(2)}</td>
                                    <td>{item.quantity}</td>
                                    <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                                <td><strong>₹{order.totalAmount.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
    );
};

export default ViewOrder;