import Brand from '../../models/brand.models.js';
import { AppError } from '../../utils/AppError.js';

// @desc    Create a new brand
// @route   POST /api/brands
// @access  Private/Admin
export const createBrand = async (req, res) => {
    try {
        const { name, description } = req.body;
        const logo = req.file ? {
            path: req.file.filename,
            isUrl: false
        } : req.body.logo;

        const brand = await Brand.create({
            name,
            description,
            logo,
            createdBy: req.user._id
        });

        res.status(201).json(brand);
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find({}).populate('createdBy', 'firstName lastName');
        res.json(brands);
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
export const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id)
            .populate('createdBy', 'firstName lastName');

        if (!brand) {
            throw new AppError('Brand not found', 404);
        }

        res.json(brand);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
export const updateBrand = async (req, res) => {
    try {
        const { name, description } = req.body;
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            throw new AppError('Brand not found', 404);
        }

        brand.name = name || brand.name;
        brand.description = description || brand.description;

        if (req.file) {
            brand.logo = {
                path: req.file.filename,
                isUrl: false
            };
        } else if (req.body.logo) {
            brand.logo = req.body.logo;
        }

        const updatedBrand = await brand.save();
        res.json(updatedBrand);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
export const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            throw new AppError('Brand not found', 404);
        }

        await brand.deleteOne();
        res.json({ message: 'Brand removed successfully' });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Search brands
// @route   GET /api/brands/search
// @access  Public
export const searchBrands = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i'
                }
            }
            : {};

        const brands = await Brand.find({ ...keyword });
        res.json(brands);
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};