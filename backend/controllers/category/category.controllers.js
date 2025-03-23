import Category from '../../models/category.models.js';
import { AppError } from '../../utils/AppError.js';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file ? {
            path: req.file.filename,
            isUrl: false
        } : req.body.image;

        const category = await Category.create({
            name,
            description,
            image,
            createdBy: req.user._id
        });

        res.status(201).json(category);
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({})
            .populate('createdBy', 'firstName lastName');
        res.json(categories);
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('createdBy', 'firstName lastName');

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        res.json(category);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        category.name = name || category.name;
        category.description = description || category.description;

        if (req.file) {
            category.image = {
                path: req.file.filename,
                isUrl: false
            };
        } else if (req.body.image) {
            category.image = req.body.image;
        }

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        // Check if category has associated products
        const hasProducts = await Product.exists({ category: req.params.id });
        if (hasProducts) {
            throw new AppError('Cannot delete category with associated products', 400);
        }

        await category.deleteOne();
        res.json({ message: 'Category removed successfully' });
    } catch (error) {
        throw new AppError(error.message, error.statusCode || 400);
    }
};

// @desc    Search categories
// @route   GET /api/categories/search
// @access  Public
export const searchCategories = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i'
                }
            }
            : {};

        const categories = await Category.find({ ...keyword });
        res.json(categories);
    } catch (error) {
        throw new AppError(error.message, 400);
    }
};