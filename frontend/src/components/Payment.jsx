import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from './Cart/CartContext';
import { OrderApi } from './OrderApi';
import { toast } from 'react-toastify';
import './Payment.css';

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [order, setOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentDetails, setPaymentDetails] = useState({
        accountNumber: '',
        bankName: '',
        holderName: '',
        esewaId: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const response = await OrderApi.getOrderDetails(orderId);
            setOrder(response.order);
        } catch (error) {
            toast.error('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
    
        try {
            if (!isFormValid()) {
                throw new Error('Please fill in all required fields correctly');
            }
    
            // Process payment and update order status
            const response = await OrderApi.updatePaymentStatus(orderId, {
                orderId, // Include orderId in payment data
                paymentMethod: 'ONLINE', // Map both BANK and ESEWA to ONLINE
                paymentDetails: {
                    ...paymentDetails,
                    paymentDate: new Date().toISOString()
                }
            });
    
            if (response.success) {
                // Show success message
                toast.success('Order placed successfully!');
                
                // Clear cart
                clearCart();
                
                // Redirect to success page
                navigate(`/order-success/${orderId}`);
            }
        } catch (error) {
            toast.error(error.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const isFormValid = () => {
        if (!paymentMethod) return false;
        
        if (paymentMethod === 'BANK') {
            return paymentDetails.accountNumber && 
                   paymentDetails.bankName && 
                   paymentDetails.holderName &&
                   /^\d{10,16}$/.test(paymentDetails.accountNumber);
        }
        
        if (paymentMethod === 'ESEWA') {
            return paymentDetails.esewaId && 
                   paymentDetails.holderName &&
                   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentDetails.esewaId);
        }
        
        return false;
    };

    if (isLoading) {
        return (
            <div className="container mt-5 pt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-5 pt-5">
            <div className="row">
                {/* Order Summary - Left Side */}
                <div className="col-md-4 bg-light">
                    <div className="p-4">
                        <h4 className="mb-4">Order Summary</h4>
                        {order && (
                            <>
                                <div className="order-details mb-4">
                                    <p className="text-muted mb-2">Order #{orderId}</p>
                                    <hr />
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="d-flex justify-content-between mb-2">
                                            <span>{item.product.name} × {item.quantity}</span>
                                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                    <hr />
                                    <div className="d-flex justify-content-between mb-2">
                                        <strong>Subtotal</strong>
                                        <span>₹{order.totalAmount?.toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Shipping</span>
                                        <span>FREE</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                        <strong>Total</strong>
                                        <strong className="text-primary">₹{order.totalAmount?.toFixed(2)}</strong>
                                    </div>
                                </div>

                                <div className="shipping-info">
                                    <h5 className="mb-3">Shipping Details</h5>
                                    <p className="mb-1">{order.shippingAddress?.name}</p>
                                    <p className="mb-1">{order.shippingAddress?.street}</p>
                                    <p className="mb-1">
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pinCode}
                                    </p>
                                    <p>{order.shippingAddress?.phone}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Payment Form - Right Side */}
                <div className="col-md-8">
                    <div className="container py-4">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="card shadow-sm">
                                    <div className="card-body p-4">
                                        <h3 className="card-title text-center mb-4">Secure Payment</h3>
                                        
                                        <form onSubmit={handlePaymentSubmit}>
                                            <div className="mb-4">
                                                <label className="form-label fw-bold">Payment Method</label>
                                                <select 
                                                    className="form-select form-select-lg"
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select payment method</option>
                                                    <option value="BANK">Bank Transfer</option>
                                                    <option value="ESEWA">eSewa</option>
                                                </select>
                                            </div>

                                            {paymentMethod === 'BANK' && (
                                                <>
                                                    <div className="mb-3">
                                                        <label className="form-label">Account Number</label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-lg"
                                                            value={paymentDetails.accountNumber}
                                                            onChange={(e) => setPaymentDetails(prev => ({
                                                                ...prev,
                                                                accountNumber: e.target.value.replace(/\D/g, '')
                                                            }))}
                                                            maxLength={16}
                                                            required
                                                        />
                                                        <div className="form-text">Enter 10-16 digit account number</div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">Bank Name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-lg"
                                                            value={paymentDetails.bankName}
                                                            onChange={(e) => setPaymentDetails(prev => ({
                                                                ...prev,
                                                                bankName: e.target.value
                                                            }))}
                                                            required
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {paymentMethod === 'ESEWA' && (
                                                <div className="mb-3">
                                                    <label className="form-label">eSewa ID</label>
                                                    <input
                                                        type="email"
                                                        className="form-control form-control-lg"
                                                        value={paymentDetails.esewaId}
                                                        onChange={(e) => setPaymentDetails(prev => ({
                                                            ...prev,
                                                            esewaId: e.target.value
                                                        }))}
                                                        required
                                                    />
                                                </div>
                                            )}

                                            {paymentMethod && (
                                                <div className="mb-4">
                                                    <label className="form-label">Account Holder Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-lg"
                                                        value={paymentDetails.holderName}
                                                        onChange={(e) => setPaymentDetails(prev => ({
                                                            ...prev,
                                                            holderName: e.target.value
                                                        }))}
                                                        required
                                                    />
                                                </div>
                                            )}

                                            <button 
                                                type="submit" 
                                                className="btn btn-primary btn-lg w-100"
                                                disabled={isProcessing || !isFormValid()}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Processing Payment...
                                                    </>
                                                ) : (
                                                    'Complete Payment'
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;