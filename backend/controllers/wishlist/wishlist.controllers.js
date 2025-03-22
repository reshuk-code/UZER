import Wishlist from '../../models/wishlist.models.js';
import Product from '../../models/product.models.js';
import AppError from '../../utils/AppError.js';


const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
        .populate({
            path: 'products',
            select: 'name price images stock'
        });

    if (!wishlist) {
        // Create new wishlist if none exists
        return res.json({ wishlist: [] });
    }

    res.json({ wishlist: wishlist.products });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    if (!productId) {
        throw new AppError('Product ID is required', 400);
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
        // Create new wishlist if none exists
        wishlist = await Wishlist.create({
            user: req.user._id,
            products: [productId]
        });
    } else {
        // Add product if not already in wishlist
        if (!wishlist.hasProduct(productId)) {
            wishlist.addProduct(productId);
            await wishlist.save();
        }
    }

    res.status(200).json({
        success: true,
        message: 'Product added to wishlist'
    });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        throw new AppError('Wishlist not found', 404);
    }

    wishlist.removeProduct(productId);
    await wishlist.save();

    res.status(200).json({
        success: true,
        message: 'Product removed from wishlist'
    });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        throw new AppError('Wishlist not found', 404);
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
        success: true,
        message: 'Wishlist cleared'
    });
});