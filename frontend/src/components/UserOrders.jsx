import React, { useState, useEffect } from 'react';
import { UserApi } from '../User/UserApi/UserApi';
import './UserOrders.css';

const UserOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await UserApi.getUserOrders();
            setOrders(response.orders || []);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'Pending': 'warning',
            'Processing': 'info',
            'Shipped': 'primary',
            'Delivered': 'success',
            'Cancelled': 'danger'
        };
        return `badge bg-${statusClasses[status] || 'secondary'}`;
    };

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="user-orders p-3">
            <h4 className="mb-4">My Orders</h4>
            
            {orders.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-box fs-1 text-muted"></i>
                    <p className="mt-3">You haven't placed any orders yet</p>
                </div>
            ) : (
                <div className="accordion" id="ordersAccordion">
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
                                        <div>
                                            <span className={getStatusBadgeClass(order.orderStatus)}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            </h2>
                            <div 
                                id={`order-${order._id}`}
                                className="accordion-collapse collapse"
                                data-bs-parent="#ordersAccordion"
                            >
                                <div className="accordion-body">
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <h6 className="mb-3">Order Summary</h6>
                                            <p className="mb-2">Total Amount: ${order.totalAmount.toFixed(2)}</p>
                                            <p className="mb-2">Payment Status: {order.paymentStatus}</p>
                                            <p>Order Date: {new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="mb-3">Shipping Address</h6>
                                            <p className="mb-1">{order.shippingAddress.name}</p>
                                            <p className="mb-1">{order.shippingAddress.street}</p>
                                            <p className="mb-1">
                                                {order.shippingAddress.city}, {order.shippingAddress.state}
                                            </p>
                                            <p className="mb-0">{order.shippingAddress.pinCode}</p>
                                        </div>
                                    </div>
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
                                                    <tr key={item._id}>
                                                        <td>{item.name}</td>
                                                        <td>${item.price.toFixed(2)}</td>
                                                        <td>{item.quantity}</td>
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

export default UserOrders;