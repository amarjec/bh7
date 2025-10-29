import customerModel from "../models/customerModel.js";

// --- 1. Create a New Customer ---
export const createCustomer = async (req, res) => {
    const { name, address, number } = req.body;
    const userId = req.userId; // Get user ID from userAuth middleware

    if (!name) {
        return res.status(400).json({ 
            success: false, 
            message: "Customer name is required." 
        });
    }
    if (!number) {
        return res.status(400).json({ 
            success: false, 
            message: "Customer number is required." 
        });
    }

    try {
        const newCustomer = new customerModel({ 
            name,
            address,
            number,
            user: userId, // Link to the logged-in user
         });
        await newCustomer.save();

        res.status(201).json({
            success: true,
            message: "Customer created successfully.",
            customer: newCustomer,
        });

    } catch (error) {
        console.error("Error creating customer:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// --- 2. Get All Customers for the Logged-in User ---
export const getMyCustomers = async (req, res) => {
    const userId = req.userId; // Get user ID from userAuth middleware

    try {
        // Find all customers where the 'user' field matches the logged-in user's ID
        const customers = await customerModel.find({ user: userId })
                                            .sort({ createdAt: -1 }); // Show newest first
        
        res.status(200).json({
            success: true,
            customers: customers,
        });

    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};