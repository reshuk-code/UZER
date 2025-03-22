import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserApi } from '../components/User/UserApi/UserApi';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchWishlist = async () => {
        if (!localStorage.getItem('token')) return;
        
        try {
            setIsLoading(true);
            const response = await UserApi.getWishlist();
            setWishlistItems(response.wishlist || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            isLoading,
            fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};