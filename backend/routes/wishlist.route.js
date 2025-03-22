import express from 'express';
import { protect } from '../config/auth/auth.js';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
} from '../controllers/wishlist/wishlist.controllers.js';

const router = express.Router();

// Protect all wishlist routes
router.use(protect);

router.route('/')
    .get(getWishlist)
    .post(addToWishlist)
    .delete(clearWishlist);

router.delete('/:productId', removeFromWishlist);

export default router;