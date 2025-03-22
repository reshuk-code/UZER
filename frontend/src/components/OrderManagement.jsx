import React, { useState, useEffect } from 'react';
import { UserApi } from './User/UserApi/UserApi';

import './OrderManagement.css';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await UserApi.getOrders();
            setOrders(response.orders || []);
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to fetch orders',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setIsLoading(true);
            await UserApi.updateOrderStatus(orderId, newStatus);
            await fetchOrders();
            setAlert({
                show: true,
                message: 'Order status updated successfully',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to update order status',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="order-management p-4">
            {alert.show && (
                <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`}>
                    {alert.message}
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setAlert({ show: false })}
                    />
                </div>
            )}

            <div className="card">
                <div className="card-body">
      

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>#{order.orderNumber}</td>
                                            <td>{order.user.firstName} {order.user.lastName}</td>
                                            <td>${order.totalAmount.toFixed(2)}</td>
                                            <td>
                                                <select
                                                    className={`form-select form-select-sm status-${order.orderStatus.toLowerCase()}`}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    disabled={isLoading}
                                                >
                                                    <option value="Pending">Pending</option>
    <option value="Processing">Processing</option>
    <option value="Shipped">Shipped</option>
    <option value="Delivered">Delivered</option>
    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td>
                                                <span className={`badge bg-${order.isPaid ? 'success' : 'warning'}`}>
                                                    {order.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            

{isModalOpen && selectedOrder && (
    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">
                        Order Details #{selectedOrder.orderNumber}
                    </h5>
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setIsModalOpen(false)}
                    />
                </div>
                <div className="modal-body">
                    <div className="row">
                        <div className="col-md-6">
                            <h6>Customer Information</h6>
                            <p>Name: {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                            <p>Email: {selectedOrder.user?.email}</p>
                            <p>Phone: {selectedOrder.user?.phoneNumber || 'N/A'}</p>
                        </div>
                        <div className="col-md-6">
                            <h6>Shipping Address</h6>
                            <p>{selectedOrder.shippingAddress?.street}</p>
                            <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                            <p>{selectedOrder.shippingAddress?.pinCode}</p>
                        </div>
                    </div>
                    <hr />
                    <h6>Order Items</h6>
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
                                {selectedOrder.orderItems?.map((item) => (
                                    <tr key={item._id}>
                                        <td>{item.name || 'N/A'}</td>
                                        <td>${item.price?.toFixed(2) || '0.00'}</td>
                                        <td>{item.quantity || 0}</td>
                                        <td>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="text-end">Subtotal:</td>
                                    <td>${(selectedOrder.totalAmount || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="3" className="text-end">Shipping:</td>
                                    <td>${(selectedOrder.shippingCost || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="3" className="text-end fw-bold">Total:</td>
                                    <td className="fw-bold">${(selectedOrder.totalAmount || 0).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default OrderManagement;