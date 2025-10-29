import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, User, Home, Phone, ArrowLeft, Send } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

const FinalQuotation = () => {
    const { list, selectedCustomer, navigate, setUser } = useAppContext();

    // --- State Management ---
    const [quoteItems, setQuoteItems] = useState([]); // Will store full product info
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

  // --- Data Fetching ---
    useEffect(() => {
        // If we are in the middle of saving, don't run any of this logic.
        // This prevents the hook from re-running when we clear the state.
        if (isCreating) {
            return;
        }
        // --- FIX 1: ADD GUARD CLAUSES ---
        if (!selectedCustomer) {
            toast.error("No customer selected.");
            navigate('/customer'); // Redirect to customer page
            return; // Stop execution
        }

        if (Object.keys(list).length === 0) {
            toast.error("Your quotation list is empty.");
            navigate('/categories'); // Redirect to main shop page
            return; // Stop execution
        }
        // --- END OF FIX ---

        const fetchQuoteDetails = async () => {
            setLoading(true);
            try {
                const productIds = Object.keys(list);
                // Your API call is correct, assuming your axios base URL is set to '/api'
                const res = await axios.post('/product/get-details-for-list', { productIds });
                
                const products = res.data.products;
                let calculatedTotal = 0;

                // Combine DB product info with context quantity
                const items = products.map(product => {
                    // ... (rest of your logic is fine)
                    const quantity = list[product._id];
                    const itemTotal = product.sellingPrice * quantity;
                    calculatedTotal += itemTotal;

                    return {
                        _id: product._id,
                        label: product.label,
                        sellingPrice: product.sellingPrice,
                        quantity: quantity,
                        total: itemTotal,
                    };
                });

                setQuoteItems(items);
                setTotal(calculatedTotal);
                
            } catch (error) {
                console.error("Error fetching quote details:", error);
                toast.error(error.response?.data?.message || "Failed to get quote details");
                navigate(-1); // Go back if it fails
            } finally {
                setLoading(false);
            }
        };

        fetchQuoteDetails();
    }, [list, selectedCustomer, navigate, isCreating]);


    // --- Handlers ---
    const handleSaveQuote = async () => {
        setIsCreating(true);
        try {
            const res = await axios.post('/quote/create', {
                customerId: selectedCustomer._id,
                itemsList: list, // Send the simple {id: qty} list
            });

            if (res.data.success) {
                toast.success("Quote created successfully!");

                // Check if the newCredit value was sent back
                if (res.data.newCredit !== null && res.data.newCredit !== undefined) {
                    // Update the user state in the context
                    setUser(prevUser => ({
                        ...prevUser,
                        credit: res.data.newCredit
                    }));
                }

                
                // Navigate to home or a "My Quotes" page
                navigate('/history');

            }
        } catch (error) {
            console.error("Error creating quote:", error);
            toast.error(error.response?.data?.message || "Failed to save quote");
        } finally {
            setIsCreating(false);
        }
        
    };
  
   

    // --- Render ---
    if (loading) {
        return (
            <>
                <Navbar title="Building Quote..." />
                <div className='flex justify-center items-center h-64'>
                    <Loader2 className="animate-spin text-primaryColor" size={40} />
                </div>
            </>
        );
    }

    return (
        <div className="pb-48"> {/* Padding for sticky footer */}
            <Navbar title="Review Quotation" />

            {/* --- Customer Card --- */}
            <div className="bg-white rounded-lg shadow-md p-4 m-4 border-l-4 border-primaryColor">
                <h2 className="text-sm font-semibold text-gray-500 mb-2">CUSTOMER</h2>
                <div className="flex items-center gap-3 mb-2">
                    <User className="text-primaryColor" size={20} />
                    <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                </div>
                {selectedCustomer.number && (
                    <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={16} />
                        <span>{selectedCustomer.number}</span>
                    </div>
                )}
                {selectedCustomer.address && (
                    <div className="flex items-start gap-3 text-gray-600 mt-1">
                        <Home size={16} className="mt-1" />
                        <span>{selectedCustomer.address}</span>
                    </div>
                )}
            </div>

            {/* --- Items List Header --- */}
            <h2 className="text-sm font-semibold text-gray-500 mt-6 mb-2 px-4">ITEMS</h2>
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-100 font-medium text-xs text-gray-600">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-3 text-right">Total</div>
            </div>

            {/* --- Items List --- */}
            <div className="px-2">
                {quoteItems.map(item => (
                    <div key={item._id} className="grid grid-cols-12 gap-2 items-center p-2 border-b">
                        <div className="col-span-5 text-sm font-medium">{item.label}</div>
                        <div className="col-span-2 text-sm text-center">{item.quantity}</div>
                        <div className="col-span-2 text-sm text-right">₹{item.sellingPrice}</div>
                        <div className="col-span-3 text-sm font-semibold text-right">₹{item.total.toFixed(0)}</div>
                    </div>
                ))}
            </div>

            {/* --- Sticky Footer Totals & Save --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t-2 z-10 p-4">
                <div className="flex justify-between items-center mb-3">
                    <div className="text-lg font-medium text-gray-700">
                        Grand Total:
                    </div>
                    <div className="text-2xl font-bold text-primaryColor">
                        ₹{total.toFixed(2)}
                    </div>
                </div>

                <button
                    onClick={handleSaveQuote}
                    disabled={isCreating}
                    className="w-full py-3 px-4 rounded-md text-white font-semibold text-lg flex items-center justify-center gap-2
                                transition-all duration-300 ease-in-out
                                bg-secondaryColor hover:bg-amber-600
                                disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isCreating ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <Send size={20} />
                    )}
                    Save & Finalize Quote
                </button>
            </div>
        </div>
    );
};

export default FinalQuotation;