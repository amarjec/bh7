import categoryModel from "../models/categoryModel.js";

// --- 1. Create a New Category ---
export const createCategory = async (req, res) => {
    const { name, desc } = req.body;
    const userId = req.userId; // Get user ID from userAuth middleware

    // 1. Validation
    if (!name) {
        return res.status(400).json({ success: false, message: "Category name is required." });
    }
    if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    try {
        const existingCategory = await categoryModel.findOne({ name, user: userId });
        if (existingCategory) {
            return res.status(409).json({ success: false, message: "A category with this name already exists." });
        }

        // 3. Create and Save new category
        const newCategory = new categoryModel({
            name,
            desc,
            user: userId,
        });

        await newCategory.save();

        // 4. Respond with success
        res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category: newCategory,
        });

    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ success: false, message: "Server error creating category." });
    }
};


// --- 2. Get All Categories (Corrected) ---
export const getAllCategories = async (req, res) => {
    const userId = req.userId; // Get user ID
    if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    try {
        const categories = await categoryModel.find({ user: userId });

        res.status(200).json({
            success: true,
            categories: categories,
        });

    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: "Server error fetching categories." });
    }
};

// --- 3. Get a Single Category by ID (Corrected) ---
export const getCategoryById = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId; 

    if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    try {
        const category = await categoryModel.findOne({ _id: id, user: userId });
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        res.status(200).json({ success: true, category: category });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

