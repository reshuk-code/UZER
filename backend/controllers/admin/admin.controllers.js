import Product from '../../models/product.models.js';
import Order from '../../models/order.models.js';
import User from '../../models/user.models.js';
import Category from '../../models/category.models.js';
import Brand from '../../models/brand.models.js';
import asyncHandler from 'express-async-handler';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    const revenue = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'firstName lastName email');

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
        .select('name stock price')
        .limit(5);

    const topSellingProducts = await Order.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalSold: { $sum: '$items.quantity' },
                revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
    ]);

    await Product.populate(topSellingProducts, {
        path: '_id',
        select: 'name price'
    });

    res.json({
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: revenue[0]?.total || 0,
        recentOrders,
        lowStockProducts,
        topSellingProducts,
        lastUpdated: new Date()
    });
});

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
export const getSalesReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
        query.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const salesData = await Order.aggregate([
        { $match: { ...query, paymentStatus: 'paid' } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                orders: { $sum: 1 },
                revenue: { $sum: '$totalAmount' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json(salesData);
});

// @desc    Get inventory report
// @route   GET /api/admin/reports/inventory
// @access  Private/Admin
export const getInventoryReport = asyncHandler(async (req, res) => {
    const inventory = await Product.aggregate([
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand'
            }
        },
        {
            $unwind: { 
                path: '$category',
                preserveNullAndEmptyArrays: true 
            }
        },
        {
            $unwind: { 
                path: '$brand',
                preserveNullAndEmptyArrays: true 
            }
        },
        {
            $project: {
                name: 1,
                stock: 1,
                price: 1,
                category: '$category.name',
                brand: '$brand.name',
                value: { $multiply: ['$price', '$stock'] }
            }
        },
        {
            $group: {
                _id: '$category',
                products: { $push: '$$ROOT' },
                totalValue: { $sum: '$value' },
                averagePrice: { $avg: '$price' },
                totalStock: { $sum: '$stock' }
            }
        }
    ]);

    res.json(inventory);
});

// @desc    Get revenue statistics
// @route   GET /api/admin/stats/revenue
// @access  Private/Admin
export const getRevenueStats = asyncHandler(async (req, res) => {
    const { period = 'monthly' } = req.query;

    let groupBy = {
        monthly: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        weekly: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
        daily: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
    }[period];

    const revenueStats = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
            $group: {
                _id: groupBy,
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 },
                averageOrderValue: { $avg: '$totalAmount' }
            }
        },
        { $sort: { _id: 1 } },
        { $limit: 12 }
    ]);

    res.json(revenueStats);
});

// @desc    Get user statistics
// @route   GET /api/admin/stats/users
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({
        createdAt: { 
            $gte: new Date(new Date().setHours(0,0,0,0)) 
        }
    });

    const userStats = await User.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } },
        { $limit: 6 }
    ]);

    res.json({
        totalUsers,
        newUsersToday,
        userGrowth: userStats
    });
});

// @desc    Get product statistics
// @route   GET /api/admin/stats/products
// @access  Private/Admin
export const getProductStats = asyncHandler(async (req, res) => {
    const categoryDistribution = await Product.aggregate([
        {
            $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: '$category' },
        {
            $group: {
                _id: '$category.name',
                count: { $sum: 1 },
                totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
            }
        }
    ]);

    const brandDistribution = await Product.aggregate([
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand'
            }
        },
        { $unwind: '$brand' },
        {
            $group: {
                _id: '$brand.name',
                count: { $sum: 1 },
                totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
            }
        }
    ]);

    const priceRanges = await Product.aggregate([
        {
            $bucket: {
                groupBy: '$price',
                boundaries: [0, 50, 100, 200, 500, 1000, Infinity],
                default: 'Other',
                output: {
                    count: { $sum: 1 },
                    products: { $push: { name: '$name', price: '$price' } }
                }
            }
        }
    ]);

    res.json({
        categoryDistribution,
        brandDistribution,
        priceRanges
    });
});