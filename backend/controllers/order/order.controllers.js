import Order from '../../models/order.models.js';
import Product from '../../models/product.models.js';
import  AppError  from '../../utils/AppError.js';
import Address from '../../models/address.models.js';
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
    try {
        const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
        
        // Validate order items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new AppError('No order items provided', 400));
        }

        // Fetch complete shipping address
        const address = await Address.findById(shippingAddress._id);
        if (!address) {
            return next(new AppError('Shipping address not found', 404));
        }

        // Create order with validated data
        const order = await Order.create({
            user: req.user._id,
            orderItems: items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                name: item.name || 'Product Name' // You might want to fetch this from product
            })),
            shippingAddress: {
                _id: address._id,
                name: address.name,
                street: address.street,
                city: address.city,
                state: address.state,
                pinCode: address.pinCode,
                phone: address.phone
            },
            paymentMethod,
            paymentStatus: paymentMethod === 'ONLINE' ? 'Pending' : 'Complete',
            totalAmount,
            orderStatus: 'Pending'
        });

        res.status(201).json({
            status: 'success',
            order
        });

    } catch (error) {
        console.error('Order creation error:', error);
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('orderItems.product', 'name images');

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Check if user is authorized to view this order
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            throw new AppError('Not authorized', 403);
        }

        res.json(order);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.orderStatus = status;

        // If order is delivered, update stock
        if (status === 'Delivered') {
            for (const item of order.orderItems) {
                const product = await Product.findById(item.product);
                if (product.stock < item.quantity) {
                    return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
                }
                product.stock -= item.quantity;
                await product.save();
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({ success: false, message: 'Order status update failed' });
    }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
export const updatePaymentStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        order.paymentStatus = 'Paid';
        order.orderStatus = 'Processing';

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.page) || 1;

        const count = await Order.countDocuments();
        const orders = await Order.find({})
            .populate('user', 'firstName lastName')
            .sort('-createdAt')
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            orders,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};

export const processPayment = async (req, res) => {
    const { id } = req.params;
    const { paymentMethod, paymentDetails } = req.body;

    try {
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update payment status and details
        order.paymentStatus = 'Paid';
        order.paymentMethod = paymentMethod;
        order.paymentDetails = paymentDetails;
        await order.save();

         // Update stock for each product in the order
         for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }
            product.stock -= item.quantity;
            await product.save();
        }

        res.status(200).json({ success: true, message: 'Payment processed and stock updated successfully' });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ success: false, message: 'Payment processing failed' });
    }
};

export const updateOrderStock = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate('items.product');

        if (!order) {
            throw new AppError('Order not found', 404);
        }

        // Verify order belongs to user
        if (order.user.toString() !== req.user._id.toString()) {
            throw new AppError('Not authorized', 403);
        }

        // Update stock for each product
        for (const item of order.items) {
            const product = item.product;
            if (product.stock < item.quantity) {
                throw new AppError(`Insufficient stock for ${product.name}`, 400);
            }
            product.stock -= item.quantity;
            await product.save();
        }

        res.status(200).json({
            status: 'success',
            message: 'Stock updated successfully'
        });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};