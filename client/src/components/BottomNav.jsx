import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const BottomNav = () => {
    // Get the global list, setter, and navigate function
    const { list, setList, navigate, user, axios, setUser } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1--- CLEAR Button Handler ---
    const handleClear = () => {
        if (isSubmitting) return; // Don't clear while submitting
        setList({});
        toast.success("List cleared!");
    };

    // 2. --- GET QUOTE Button Handler ---
    const handleGetQuote = async () => {
        // Prevent double-click
        setIsSubmitting(true);
        

        if (user && user.credit <= 0) {
            toast.error("Buy credit to create new quotation.");
            navigate('/pro');
            return; // Stop execution
        }
        // Check if the global list has any items
        // We use Object.keys() to see if the list object is empty
        if (Object.keys(list).length === 0) {
            toast.error("Your quotation list is empty.");
            return; // Stop and don't navigate
        }
        
        // --- All checks passed, now call the backend ---
        if (isSubmitting) return;
        try {
            // Call the new endpoint to use one credit
            const res = await axios.post('/user/use-credit'); 

            if (res.data.success) {
                // Update the user's credit in the global context
                setUser(prevUser => ({
                    ...prevUser,
                    credit: res.data.newCredit
                }));
                
                // Now, navigate to the customer page
                navigate('/customer');
            }
        } catch (error) {
            console.error("Error using credit:", error);
            toast.error(error.response?.data?.message || "Failed to use credit.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t-2 z-10 p-4 flex items-center gap-4">
            
            {/* --- CLEAR Button --- */}
            <button
                type="button" // Prevents form submission
                onClick={handleClear}
                className="flex-1 w-full py-3 px-4 rounded-md text-gray-700 font-semibold text-lg flex items-center justify-center gap-2
                            transition-all duration-300 ease-in-out
                            bg-gray-200 hover:bg-gray-300"
            >
                <Trash2 size={20} />
                Clear
            </button>

            {/* --- GET QUOTE Button --- */}
            <button
                type="button" // Prevents form submission
                onClick={handleGetQuote}
                className="flex-1 w-full py-3 px-4 rounded-md text-white font-semibold text-lg flex items-center justify-center gap-2
                            transition-all duration-300 ease-in-out
                            bg-secondaryColor hover:bg-amber-600"
            >
                <FileText size={20} />
                Get Quote
            </button>
        </div>
    );
};

export default BottomNav;