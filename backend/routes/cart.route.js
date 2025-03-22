import express from 'express';
import { 
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cart/cart.controllers.js';
import { protect } from '../config/auth/auth.js';

const router = express.Router();

// Protect all cart routes
router.use(protect);

// Cart routes
router.route('/')
    .get(getCart)
    .post(addToCart)
    .delete(clearCart);

router.route('/:productId')
    .put(updateCartItem)
    .delete(removeFromCart);

export default router;