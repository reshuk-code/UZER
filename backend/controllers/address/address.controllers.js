import Address from '../../models/address.models.js';
import User from '../../models/user.models.js';
import AppError from '../../utils/AppError.js';

// Get all addresses for a user
export const addAddress = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { name, phone, street, city, state, pinCode, isDefault } = req.body;

        // Validate required fields with detailed error messages
        const requiredFields = { name, phone, street, city, state, pinCode };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            return next(
                new AppError(
                    `Missing required fields: ${missingFields.join(', ')}`, 
                    400
                )
            );
        }

        // Validate phone number format
        if (!/^[0-9]{10}$/.test(phone)) {
            return next(
                new AppError('Phone number must be 10 digits', 400)
            );
        }

        // Validate PIN code format
        if (!/^[0-9]{5}$/.test(pinCode)) {
            return next(
                new AppError('PIN code must be 5 digits', 400)
            );
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        // Create new address
        const address = await Address.create({
            user: userId,
            name,
            phone,
            street,
            city,
            state,
            pinCode,
            isDefault: isDefault || false
        });

        // If this is default address, remove default from other addresses
        if (isDefault) {
            await Address.updateMany(
                { 
                    user: userId, 
                    _id: { $ne: address._id },
                    isDefault: true 
                },
                { $set: { isDefault: false } }
            );
        }

        // Add address to user's addresses array
        await User.findByIdAndUpdate(
            userId,
            { $push: { addresses: address._id } },
            { new: true }
        );

        // Return the newly created address
        res.status(201).json({
            status: 'success',
            address: await Address.findById(address._id) // Fetch fresh copy
        });

    } catch (error) {
        console.error('Address creation error:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return next(new AppError('Address already exists', 400));
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return next(new AppError(`Validation Error: ${messages.join(', ')}`, 400));
        }

        next(new AppError(
            'Error adding address: ' + (error.message || 'Unknown error'), 
            500
        ));
    }
};
export const getAddresses = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // Find all addresses for the user
        const addresses = await Address.find({ user: userId })
            .sort({ isDefault: -1, createdAt: -1 }); // Default address first, then by creation date

        if (!addresses) {
            return next(new AppError('No addresses found', 404));
        }

        res.status(200).json({
            status: 'success',
            results: addresses.length,
            addresses
        });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        next(new AppError('Error fetching addresses', 500));
    }
};

// Update address
export const updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const userId = req.user._id;
        const updateData = req.body;

        const address = await Address.findOne({ _id: addressId, user: userId });

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        // If setting as default, remove default from other addresses
        if (updateData.isDefault) {
            await Address.updateMany(
                { user: userId, _id: { $ne: addressId } },
                { $set: { isDefault: false } }
            );
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            address: updatedAddress
        });
    } catch (error) {
        next(new AppError('Error updating address', 500));
    }
};

// Delete address
export const deleteAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const userId = req.user._id;

        const address = await Address.findOne({ _id: addressId, user: userId });

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        // Remove address from user's addresses array
        await User.findByIdAndUpdate(
            userId,
            { $pull: { addresses: addressId } }
        );

        // Delete the address
        await Address.findByIdAndDelete(addressId);

        res.status(200).json({
            status: 'success',
            message: 'Address deleted successfully'
        });
    } catch (error) {
        next(new AppError('Error deleting address', 500));
    }
};

// Set default address
export const setDefaultAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const userId = req.user._id;

        const address = await Address.findOne({ _id: addressId, user: userId });

        if (!address) {
            return next(new AppError('Address not found', 404));
        }

        // Remove default from all other addresses
        await Address.updateMany(
            { user: userId },
            { $set: { isDefault: false } }
        );

        // Set this address as default
        address.isDefault = true;
        await address.save();

        res.status(200).json({
            status: 'success',
            address
        });
    } catch (error) {
        next(new AppError('Error setting default address', 500));
    }
};