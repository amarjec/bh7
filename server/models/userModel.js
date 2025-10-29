import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    
    name: {type: String,},
    number: {type: String, required: true, unique: true},
    address: {type: String, },
    otp: {type: String, },
    otpExpiry: {type: Date, default: null}, 
    isVerified: {type: Boolean, default: false},
    pin:{type: Number, minlength: 4, },
    credit:{type: Number, default: 100},

}, {timestamps: true})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;