import React from 'react';
import { Link } from 'react-router-dom';
import { BiTrash, BiMinus, BiPlus } from 'react-icons/bi';
import { useCart } from './CartContext';
import './css/Cart.css';

const Cart = () => {
    const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();

    if (!items) {
        return (
            <div className="container mt-5 pt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 pt-5">
            <h2 className="mb-4">Shopping Cart</h2>

            {items.length === 0 ? (
                <div className="text-center py-5">
                    <h3>Your cart is empty</h3>
                    <p className="text-muted mb-4">Browse our products and add some items to your cart</p>
                    <Link to="/products" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <>
                    <div className="row">
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-body">
                                    {items.map(item => (
                                        <div key={item._id} className="cart-item mb-3">
                                            <div className="row align-items-center">
                                                <div className="col-md-2">
                                                    <img
                                                        src={"https://uzer-server.onrender.com"+item.images[0]?.path || '/placeholder.jpg'}
                                                        alt={item.name}
                                                        className="img-fluid rounded"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <h5 className="mb-1">{item.name}</h5>
                                                    <p className="text-muted mb-0">₹{item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="quantity-control">
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm"
                                                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <BiMinus />
                                                        </button>
                                                        <span className="mx-2">{item.quantity}</span>
                                                        <button
                                                            className="btn btn-outline-secondary btn-sm"
                                                            onClick={() => updateQuantity(item._id, Math.min(item.quantity + 1, item.stock))}
                                                            disabled={item.quantity >= item.stock}
                                                        >
                                                            <BiPlus />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="col-md-2 text-end">
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => removeFromCart(item._id)}
                                                    >
                                                        <BiTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">Order Summary</h5>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span>Subtotal</span>
                                        <span>₹{getCartTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span>Shipping</span>
                                        <span>Free</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <strong>Total</strong>
                                        <strong>₹{getCartTotal().toFixed(2)}</strong>
                                    </div>
                                    <Link to="/checkout" className="btn btn-primary w-100">
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;