import quoteModel from '../models/quoteModel.js';
import productModel from '../models/productModel.js';
import customerModel from '../models/customerModel.js';

// --- 1. Create a New Quote ---
export const createQuote = async (req, res) => {
    const { customerId, itemsList } = req.body; // itemsList is { "productId": quantity, ... }
    const userId = req.userId;

    if (!customerId || !itemsList || Object.keys(itemsList).length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: "Customer and at least one item are required." 
        });
    }

    try {
        // --- Security Step: Verify Customer belongs to this user ---
        const customer = await customerModel.findOne({ _id: customerId, user: userId });
        if (!customer) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        // --- Server-Side Calculation ---
        // 1. Get all product IDs from the client's list
        const productIds = Object.keys(itemsList);

        // 2. Fetch all those products from the DB
        // We select only the fields we need for security and performance
        const products = await productModel.find({ 
            '_id': { $in: productIds } 
        }).select('label sellingPrice');

        // 3. Build the 'items' array and calculate total
        let totalAmount = 0;
        const quoteItems = [];

        for (const product of products) {
            const quantity = itemsList[product._id];
            
            // This should not happen if client-side validation is good, but check anyway
            if (!quantity || quantity <= 0) continue; 
            
            // Create the snapshot of the item
            quoteItems.push({
                product: product._id,
                productLabel: product.label,
                sellingPrice: product.sellingPrice, // Use server-side price
                quantity: quantity,
            });

            // Add to the total
            totalAmount += product.sellingPrice * quantity;
        }

        if (quoteItems.length === 0) {
             return res.status(400).json({ success: false, message: "No valid items to quote." });
        }

        // 4. Create and save the new quote
        const newQuote = new quoteModel({
            user: userId,
            customer: customerId,
            items: quoteItems,
            totalAmount: totalAmount,
            status: 'Draft',
        });

        await newQuote.save();

        res.status(201).json({
            success: true,
            message: "Quote created successfully!",
            quote: newQuote,
        });

    } catch (error) {
        console.error("Error creating quote:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// --- 2. Get All Quotes for the Logged-in User ---
export const getMyQuotes = async (req, res) => {
    const userId = req.userId;

    try {
        const quotes = await quoteModel.find({ user: userId })
            .populate('customer', 'name number') // Get customer name and number
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            quotes: quotes,
        });

    } catch (error) {
        console.error("Error fetching quotes:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// --- 3. Get a Single Quote by ID ---
export const getQuoteById = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Find the quote by its ID AND ensure it belongs to the logged-in user
        const quote = await quoteModel.findOne({ _id: id, user: userId })
            .populate('customer', 'name number address'); // Get full customer details

        if (!quote) {
            return res.status(404).json({ success: false, message: "Quote not found or access denied." });
        }

        res.status(200).json({
            success: true,
            quote: quote,
        });

    } catch (error) {
        console.error("Error fetching quote:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};


// import quoteModel from '../models/quoteModel.js';
// import productModel from '../models/productModel.js';
// import customerModel from '../models/customerModel.js';
// import userModel from '../models/userModel.js'; 

// // --- 1. Create a New Quote ---
// export const createQuote = async (req, res) => {
//     const { customerId, itemsList } = req.body;
//     const userId = req.userId;

//     try {
//         // --- 1. Validate Inputs ---
//         if (!customerId || !itemsList || Object.keys(itemsList).length === 0) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Customer and at least one item are required." 
//             });
//         }

//         // --- 2. Verify Customer ---
//         const customer = await customerModel.findOne({ _id: customerId, user: userId });
//         if (!customer) {
//             return res.status(404).json({ success: false, message: "Customer not found." });
//         }

//         // --- 3. Fetch Products and Calculate (Server-Side) ---
//         const productIds = Object.keys(itemsList);
//         const products = await productModel.find({ '_id': { $in: productIds } }).select('label sellingPrice');

//         let totalAmount = 0;
//         const quoteItems = [];

//         for (const product of products) {
//             const quantity = itemsList[product._id];
//             if (!quantity || quantity <= 0) continue; 
            
//             quoteItems.push({
//                 product: product._id,
//                 productLabel: product.label,
//                 sellingPrice: product.sellingPrice,
//                 quantity: quantity,
//             });
//             totalAmount += product.sellingPrice * quantity;
//         }

//         if (quoteItems.length === 0) {
//              return res.status(400).json({ success: false, message: "No valid items to quote." });
//         }

//         // --- 4. Create and Save the New Quote ---
//         const newQuote = new quoteModel({
//             user: userId,
//             customer: customerId,
//             items: quoteItems,
//             totalAmount: totalAmount,
//             status: 'Draft',
//         });
        
//         await newQuote.save(); // <-- FIRST, save the quote

//         // --- 5. (NEW STEP) Decrement User Credit ---
//         // We do this *after* the quote is successfully saved.
//         let updatedUserCredit = null;
//         const user = await userModel.findById(userId);
        
//         if (user) {
//             user.credit -= 1; // Reduce credit by 1
//             await user.save();
//             updatedUserCredit = user.credit;
//         } else {
//             // This is a rare edge case, but good to log
//             console.warn(`Quote ${newQuote._id} created, but user ${userId} not found to decrement credit.`);
//         }

//         // --- 6. Send Final Response ---
//         res.status(201).json({
//             success: true,
//             message: "Quote created successfully!",
//             quote: newQuote,
//             newCredit: updatedUserCredit // Send back the new credit total
//         });

//     } catch (error) {
//         console.error("Error creating quote:", error);
//         res.status(500).json({ success: false, message: "Server error." });
//     }
// };

// // --- 2. Get All Quotes for the Logged-in User ---
// export const getMyQuotes = async (req, res) => {
//     const userId = req.userId;

//     try {
//         const quotes = await quoteModel.find({ user: userId })
//             .populate('customer', 'name number') // Get customer name and number
//             .sort({ createdAt: -1 });
        
//         res.status(200).json({
//             success: true,
//             quotes: quotes,
//         });

//     } catch (error) {
//         console.error("Error fetching quotes:", error);
//         res.status(500).json({ success: false, message: "Server error." });
//     }
// };

// // --- 3. Get a Single Quote by ID ---
// export const getQuoteById = async (req, res) => {
//     const { id } = req.params;
//     const userId = req.userId;

//     try {
//         // Find the quote by its ID AND ensure it belongs to the logged-in user
//         const quote = await quoteModel.findOne({ _id: id, user: userId })
//             .populate('customer', 'name number address'); // Get full customer details

//         if (!quote) {
//             return res.status(404).json({ success: false, message: "Quote not found or access denied." });
//         }

//         res.status(200).json({
//             success: true,
//             quote: quote,
//         });

//     } catch (error) {
//         console.error("Error fetching quote:", error);
//         res.status(500).json({ success: false, message: "Server error." });
//     }
// };