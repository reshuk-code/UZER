import express from 'express';
import { 
    createOrder,
    getOrderById,
    getMyOrders,
    updateOrderStatus,
    updatePaymentStatus,
    getAllOrders,
    processPayment, // Add this
    updateOrderStock // Add this
} from '../controllers/order/order.controllers.js';
import { protect } from '../config/auth/auth.js';
import { admin } from '../config/auth/auth.js';

const router = express.Router();

// Protected routes for all authenticated users
router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/payment', processPayment); // Add payment processing route
router.put('/:id/stock', updateOrderStock); // Add stock update route

// Admin only routes
router.use(admin);
router.get('/', getAllOrders);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/pay', updatePaymentStatus);

export default router;