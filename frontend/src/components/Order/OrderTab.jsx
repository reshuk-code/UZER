import React, { useState, useEffect } from 'react';
import { UserApi } from '../User/UserApi/UserApi';
import './css/OrderTab.css';

const OrderTab = ({ user, setAlert }) => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = user?.isAdmin 
                ? await UserApi.getOrders()
                : await UserApi.getUserOrders();
            
            // Debug log to see response structure
            console.log('API Response:', response);
            
            // Check if response has orders array and set it directly
            if (response && Array.isArray(response)) {
                setOrders(response);
            } else if (response && Array.isArray(response.data)) {
                setOrders(response.data);
            } else if (response && Array.isArray(response.orders)) {
                setOrders(response.orders);
            } else {
                console.error('Unexpected response format:', response);
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setAlert({
                show: true,
                message: error.message || 'Failed to fetch orders',
                type: 'danger'
            });
            setOrders([]); // Set empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    // Debug log for orders state
    useEffect(() => {
        console.log('Current orders:', orders);
    }, [orders]);


    return (
        <div className="order-tab">
            <h4 className="mb-4">{user?.isAdmin? 'All Orders' : 'My Orders'}</h4>
            
            {orders.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-box fs-1 text-muted"></i>
                    <p className="mt-3">No orders found</p>
                </div>
            ) : (
                <div className="accordion" id="orderAccordion">
                    {orders.map((order) => (
                        <div className="accordion-item mb-3" key={order._id}>
                            <h2 className="accordion-header">
                                <button 
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#order-${order._id}`}
                                >
                                    <div className="d-flex w-100 justify-content-between align-items-center">
                                        <div>
                                            <span className="me-3">Order #{order.orderNumber}</span>
                                            <small className="text-muted">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                        <span className={`badge bg-${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </button>
                            </h2>
                            <div 
                                id={`order-${order._id}`}
                                className="accordion-collapse collapse"
                                data-bs-parent="#orderAccordion"
                            >
                                <div className="accordion-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <h6>Order Details</h6>
                                            <p className="mb-1">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                                            <p className="mb-1">Total: ${order.totalAmount.toFixed(2)}</p>
                                            <p className="mb-1">Status: {order.orderStatus}</p>
                                            <p>Payment: {order.paymentStatus}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Shipping Address</h6>
                                            <p className="mb-1">{order.shippingAddress.name}</p>
                                            <p className="mb-1">{order.shippingAddress.street}</p>
                                            <p className="mb-1">
                                                {order.shippingAddress.city}, {order.shippingAddress.state}
                                            </p>
                                            <p>{order.shippingAddress.pinCode}</p>
                                        </div>
                                    </div>
                                    <h6>Order Items</h6>
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Quantity</th>
                                                    <th>Price</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.orderItems.map((item) => (
                                                    <tr key={item._id}>
                                                        <td>{item.name}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>${item.price.toFixed(2)}</td>
                                                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const getStatusColor = (status) => {
    const colors = {
        'Pending': 'warning',
        'Processing': 'info',
        'Shipped': 'primary',
        'Delivered': 'success',
        'Cancelled': 'danger'
    };
    return colors[status] || 'secondary';
};

export default OrderTab;