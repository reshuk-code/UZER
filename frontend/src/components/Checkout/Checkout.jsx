import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Cart/CartContext';
import { UserApi } from '../User/UserApi/UserApi';
import { OrderApi } from '../OrderApi';
import './css/Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { items, getCartTotal, clearCart } = useCart();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        // Redirect if cart is empty
        if (!items.length) {
            navigate('/cart');
            return;
        }

        fetchAddresses();
    }, [items, navigate]);

    const fetchAddresses = async () => {
        try {
            const response = await UserApi.getAddresses();
            setAddresses(response.addresses);
            if (response.addresses.length > 0) {
                setSelectedAddress(response.addresses[0]._id);
            }
        } catch (error) {
            setAlert({
                show: true,
                message: 'Failed to load addresses',
                type: 'danger'
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const orderItems = items.map(item => ({
                product: item._id,
                quantity: item.quantity,
                price: item.price
            }));
    
            const orderData = {
                items: orderItems,
                shippingAddress: selectedAddress,
                paymentMethod: paymentMethod === 'online' ? 'ONLINE_PAYMENT' : 'CASH_ON_DELIVERY',
                totalAmount: getCartTotal()
            };
    
            // Create order
            const response = await OrderApi.createOrder(orderData);
    
            if (response.status === 'success') {
                // If online payment is selected, redirect to payment page
                if (paymentMethod === 'online') {
                    navigate(`/payment/${response.order._id}`);
                    return;
                }
    
                // For COD, clear cart and redirect to success page
                clearCart();
                navigate(`/order-success/${response.order._id}`);
            }
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to place order',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5 pt-5">
            <h2 className="mb-4">Checkout</h2>

            {alert.show && (
                <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
                    {alert.message}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setAlert({ show: false })}
                    />
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-8">
                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title mb-4">Shipping Address</h5>
                                {addresses.length === 0 ? (
                                    <div className="text-center py-3">
                                        <p className="mb-3">No addresses found</p>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={() => navigate('/profile')}
                                        >
                                            Add New Address
                                        </button>
                                    </div>
                                ) : (
                                    addresses.map(address => (
                                        <div key={address._id} className="form-check mb-3">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="address"
                                                id={`address-${address._id}`}
                                                value={address._id}
                                                checked={selectedAddress === address._id}
                                                onChange={(e) => setSelectedAddress(e.target.value)}
                                                required
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`address-${address._id}`}
                                            >
                                                <strong>{address.name}</strong>
                                                <br />
                                                {address.street}
                                                <br />
                                                {address.city}, {address.state} {address.pinCode}
                                                <br />
                                                Phone: {address.phone}
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="card mb-4">
                            <div className="card-body">
                                <h5 className="card-title mb-4">Payment Method</h5>
                                <div className="form-check mb-3">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        name="payment"
                                        id="cod"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        required
                                    />
                                    <label className="form-check-label" htmlFor="cod">
                                        Cash on Delivery
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        className="form-check-input"
                                        name="payment"
                                        id="online"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        required
                                    />
                                    <label className="form-check-label" htmlFor="online">
                                        Online Payment
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title mb-4">Order Summary</h5>
                                {items.map(item => (
                                    <div key={item._id} className="d-flex justify-content-between mb-2">
                                        <span>
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <hr />
                                <div className="d-flex justify-content-between mb-2">
                                    <strong>Total</strong>
                                    <strong>₹{getCartTotal().toFixed(2)}</strong>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mt-3"
                                    disabled={isLoading || !selectedAddress}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Place Order'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;