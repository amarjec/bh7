import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    label: { // The product name, e.g., "Pillar Cock"
        type: String,
        required: true,
        trim: true,
    },
    unit: { // e.g., "pcs", "set"
        type: String,
        required: true,
        default: 'pcs',
    },
    type: { // Input type
        type: String,
        required: true,
        default: 'number',
    },
    sellingPrice: { 
        type: Number,
        required: true,
        default: 0 
    },
    costPrice: {
        type: Number,
        required: true,
        default: 0
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subCategory',
        required: true,
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

const productModel = mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;

