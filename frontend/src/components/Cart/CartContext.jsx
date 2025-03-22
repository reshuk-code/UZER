import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            const existingItem = state.items.find(item => item._id === action.payload._id);
            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item._id === action.payload._id
                            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
                            : item
                    )
                };
            }
            return {
                ...state,
                items: [...state.items, { ...action.payload, quantity: 1 }]
            };

        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item._id === action.payload.productId
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                )
            };

        case 'REMOVE_FROM_CART':
            return {
                ...state,
                items: state.items.filter(item => item._id !== action.payload)
            };

        case 'CLEAR_CART':
            return {
                ...state,
                items: []
            };

        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, {
        items: JSON.parse(localStorage.getItem('cart')) || []
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state.items));
    }, [state.items]);

    const addToCart = (product) => {
        dispatch({ type: 'ADD_TO_CART', payload: product });
    };

    const updateQuantity = (productId, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    };

    const removeFromCart = (productId) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getCartTotal = () => {
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <CartContext.Provider value={{
            items: state.items,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            getCartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};