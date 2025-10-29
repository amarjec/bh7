import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js"; 

// --- 1. Create a New Product Item (FIXED) ---
export const createProduct = async (req, res) => {

    const { label, unit, type, sellingPrice, costPrice, subCategory } = req.body; 
    //subCategory refer to subCategoryId which is recieved from client side user it got from params
    
    const userId = req.userId;

    if (!label || !subCategory) {
        return res.status(400).json({ success: false, message: "Label and sub-category are required." });
    }
    
    if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    try {

        const newProduct = new productModel({
            label,
            unit: unit || 'pcs',
            type: type || 'number',
            sellingPrice: sellingPrice || 0,
            costPrice: costPrice || sellingPrice, 
            subCategory,
            user: userId,
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product: newProduct, 
        });

    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// --- 2. Get All Products (Unchanged from your file) ---
export const getProductsForSubCategory = async (req, res) => {
    const { subCategoryId } = req.params;
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const products = await productModel.find({ 
            subCategory: subCategoryId,
            user: userId 
        });

        res.status(200).json({
            success: true,
            products: products,
        });


    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// for view quote 

// --- Get Full Product Details from a list of IDs ---
export const getProductsForList = async (req, res) => {
    const { productIds } = req.body; // Expects an array of product IDs

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ success: false, message: "Product IDs are required." });
    }

    try {
        const products = await productModel.find({
            '_id': { $in: productIds }
        }).select('label sellingPrice'); // Only send what's needed

        res.status(200).json({
            success: true,
            products: products,
        });

    } catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};