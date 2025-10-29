import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Customer name is required."],
        trim: true,
    },
    address: {
        type: String,
        trim: true,
        default: '',
    },
    number: {
        type: String,
        required: [true, "Customer number is required."],
        trim: true,
    },
    // This links the customer to the user who created them
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true, // Add index for faster lookups by user
    }
}, { timestamps: true });

const customerModel = mongoose.model('customer', customerSchema);

export default customerModel;