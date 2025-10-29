import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, Search, User, Calendar, FileText } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const History = () => {
    const { navigate, setList, setSelectedCustomer } = useAppContext();

    // --- State Management ---
    const [quotes, setQuotes] = useState([]); // Master list
    const [filteredQuotes, setFilteredQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Data Fetching ---
    const fetchMyQuotes = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/quote/get-my-quotes');
            setQuotes(res.data.quotes);
            setFilteredQuotes(res.data.quotes);
        } catch (error) {
            console.error("Error fetching quotes:", error);
            toast.error(error.response?.data?.message || "Failed to fetch quotes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setList({});
        setSelectedCustomer(null);
        fetchMyQuotes();
    }, [setList, setSelectedCustomer]);

    // --- Search Filtering ---
    useEffect(() => {
        const results = quotes.filter(quote =>
            // Check customer name (if customer exists)
            (quote.customer?.name && quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            // Check quote ID
            quote._id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredQuotes(results);
    }, [searchTerm, quotes]);

    // --- Handlers ---
    const handleQuoteClick = (quoteId) => {
        // Navigate to the new details page
        navigate(`/quote-details/${quoteId}`);
    };

    // --- Render ---
    if (loading) {
        return (
            <>
                <Navbar title="Loading Quotes..." />
                <div className='flex justify-center items-center h-64'>
                    <Loader2 className="animate-spin text-primaryColor" size={40} />
                </div>
            </>
        );
    }

    return (
        <div className="pb-24">
            {/* <Navbar title="My Quotations" /> */}
            <Header />

            {/* --- Search Bar --- */}
            <div className="px-4 py-1  sticky top-17 pb-4 bg-white z-10">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by Customer name or ID.."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 border rounded-lg"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
            </div>

            {/* --- Quotes List --- */}
            <div className="p-2">
                {filteredQuotes.length === 0 ? (
                    <p className="text-center text-gray-500 mt-8">
                        {quotes.length === 0 ? "You haven't created any quotes yet." : "No quotes match your search."}
                    </p>
                ) : (
                    filteredQuotes.map(quote => (
                        <div
                            key={quote._id}
                            onClick={() => handleQuoteClick(quote._id)}
                            className="bg-white rounded-lg shadow-md p-4 m-2 border-l-4 border-primaryColor cursor-pointer transition-all hover:shadow-lg hover:bg-green-50"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="text-primaryColor" size={20} />
                                    <h3 className="text-lg font-semibold">{quote.customer?.name || 'Customer Deleted'}</h3>
                                </div>
                                <span className="text-lg font-bold text-primaryColor">
                                    ₹{quote.totalAmount.toFixed(2)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center text-gray-600 mt-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar size={16} />
                                    <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>ID: {quote._id.substring(quote._id.length - 8)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Footer />
        </div>
    );
};

export default History;