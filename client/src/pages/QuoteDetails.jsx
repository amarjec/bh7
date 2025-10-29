import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, User, Home, Phone } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

const QuoteDetails = () => {
    const { quoteId } = useParams(); // Get ID from URL
    const { navigate } = useAppContext();

    // --- State Management ---
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Data Fetching ---
    useEffect(() => {
        if (!quoteId) {
            toast.error("Invalid Quote ID");
            navigate('/my-quotes');
            return;
        }

        const fetchQuote = async () => {
            setLoading(true);
            try {
                // Use the new backend route
                const res = await axios.get(`/quote/${quoteId}`);
                setQuote(res.data.quote);
            } catch (error) {
                console.error("Error fetching quote details:", error);
                toast.error(error.response?.data?.message || "Failed to get quote");
                navigate(-1); // Go back
            } finally {
                setLoading(false);
            }
        };

        fetchQuote();
    }, [quoteId, navigate]);


    // --- Render ---
    if (loading || !quote) {
        return (
            <>
                <Navbar title="Loading Quote Details..." />
                <div className='flex justify-center items-center h-64'>
                    <Loader2 className="animate-spin text-primaryColor" size={40} />
                </div>
            </>
        );
    }

    return (
        <div className="pb-24">
            <Navbar title={`Quote #${quote._id.substring(quote._id.length - 8)}`} />

            {/* --- Customer Card --- */}
            {quote.customer ? (
                <div className="bg-white rounded-lg shadow-md p-4 m-4 border-l-4 border-primaryColor">
                    <h2 className="text-sm font-semibold text-gray-500 mb-2">CUSTOMER</h2>
                    <div className="flex items-center gap-3 mb-2">
                        <User className="text-primaryColor" size={20} />
                        <h3 className="text-lg font-semibold">{quote.customer.name}</h3>
                    </div>
                    {quote.customer.number && (
                        <div className="flex items-center gap-3 text-gray-600">
                            <Phone size={16} />
                            <span>{quote.customer.number}</span>
                        </div>
                    )}
                    {quote.customer.address && (
                        <div className="flex items-start gap-3 text-gray-600 mt-1">
                            <Home size={16} className="mt-1" />
                            <span>{quote.customer.address}</span>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-center text-gray-500 m-4">Customer details not available.</p>
            )}

            {/* --- Items List Header --- */}
            <h2 className="text-sm font-semibold text-gray-500 mt-6 mb-2 px-4">ITEMS</h2>
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-100 font-medium text-xs text-gray-600">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-3 text-right">Total</div>
            </div>

            {/* --- Items List --- */}
            {/* These items are a snapshot from when the quote was created */}
            <div className="px-2">
                {quote.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 border-b">
                        <div className="col-span-5 text-sm font-medium">{item.productLabel}</div>
                        <div className="col-span-2 text-sm text-center">{item.quantity}</div>
                        <div className="col-span-2 text-sm text-right">₹{item.sellingPrice.toFixed(2)}</div>
                        <div className="col-span-3 text-sm font-semibold text-right">
                            ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* --- Footer Total --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t-2 z-10 p-4">
                <div className="flex justify-between items-center">
                    <div className="text-lg font-medium text-gray-700">
                        Grand Total:
                    </div>
                    <div className="text-2xl font-bold text-primaryColor">
                        ₹{quote.totalAmount.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteDetails;