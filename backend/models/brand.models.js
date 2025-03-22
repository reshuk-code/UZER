import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    logo: {
        path: String,
        isUrl: {
            type: Boolean,
            default: false
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;