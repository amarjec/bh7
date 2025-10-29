import mongoose from 'mongoose';

// This is a sub-document for the items in the quote
const quoteItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productLabel: {
        type: String,
        required: true,
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    }
}, { _id: false }); // _id: false prevents sub-documents from getting their own IDs

const quoteSchema = new mongoose.Schema({
    // We can use the _id as the quote number, or add a custom one
    // For simplicity, we'll use the default _id
    
    // Link to the user who created it
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    // Link to the selected customer
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer',
        required: true,
    },
    // Array of product snapshots
    items: [quoteItemSchema],

    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Finalized'],
        default: 'Draft',
    }
}, { timestamps: true }); // Adds createdAt and updatedAt

const quoteModel = mongoose.model('Quote', quoteSchema);

export default quoteModel;