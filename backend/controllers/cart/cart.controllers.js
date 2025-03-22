import Cart from '../../models/cart.models.js';
import Product from '../../models/product.models.js';
import { AppError } from '../../utils/AppError.js';

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Verify product exists and has enough stock
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        if (product.stock < quantity) {
            throw new AppError('Insufficient stock', 400);
        }

        // Find or create cart for user
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        await cart.addItem(product, quantity);
        await cart.populate('items.product');

        res.json(cart);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');

        res.json(cart || { items: [], totalAmount: 0 });
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;

        // Verify product stock
        const product = await Product.findById(productId);
        if (!product) {
            throw new AppError('Product not found', 404);
        }
        if (product.stock < quantity) {
            throw new AppError('Insufficient stock', 400);
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        await cart.updateItemQuantity(productId, quantity);
        await cart.populate('items.product');

        res.json(cart);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        await cart.removeItem(req.params.productId);
        await cart.populate('items.product');

        res.json(cart);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};