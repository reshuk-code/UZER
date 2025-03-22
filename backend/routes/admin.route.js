import express from 'express';
import { protect, admin } from '../config/auth/auth.js';
import {
    getDashboardStats,
    getSalesReport,
    getInventoryReport,
    getRevenueStats,
    getUserStats,
    getProductStats
} from '../controllers/admin/admin.controllers.js';

const router = express.Router();

// Protect all admin routes
router.use(protect, admin);

// Dashboard and Statistics
router.get('/dashboard/stats', getDashboardStats);
router.get('/reports/sales', getSalesReport);
router.get('/reports/inventory', getInventoryReport);
router.get('/stats/revenue', getRevenueStats);
router.get('/stats/users', getUserStats);
router.get('/stats/products', getProductStats);

export default router;