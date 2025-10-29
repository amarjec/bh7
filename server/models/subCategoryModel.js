import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // This creates the link to the parent category
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category', // Must match the model name from categoryModel.js
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

const subCategoryModel = mongoose.models.subCategory || mongoose.model("subCategory", subCategorySchema);

export default subCategoryModel;

