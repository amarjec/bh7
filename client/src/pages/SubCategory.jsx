import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import toast, { Toaster } from 'react-hot-toast';
import { SquarePlus, X, Loader2, List } from 'lucide-react';
import Navbar from '../components/Navbar.jsx'; // Make sure this path is correct
import BottomNav from '../components/BottomNav.jsx';

const SubCategory = () => {
    // This gets the 'categoryId' (e.g., for "Bath Fitting") from the URL
    const { categoryId } = useParams();
    const { navigate, user, axios, } = useAppContext();

    // --- State Management ---
    const [categoryName, setCategoryName] = useState(''); // To store "Bath Fitting"
    const [subCategories, setSubCategories] = useState([]); // To store the "rows"
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // State for the new subcategory (row) form
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    // --- Data Fetching ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch the main category name (e.g., "Bath Fitting") for the title
            const categoryResponse = await axios.get(`/category/get/${categoryId}`);
            if (categoryResponse.data.success) {
                setCategoryName(categoryResponse.data.category.name);
            }

            // 2. Fetch all subcategories (rows) for this category
            const subCategoryResponse = await axios.get(`/subcategory/get-for-category/${categoryId}`);
            if (subCategoryResponse.data.success) {
                setSubCategories(subCategoryResponse.data.subCategories);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error(error.response?.data?.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when the page loads (or when categoryId changes)
    useEffect(() => {
        if (categoryId) {
            fetchData();
        }
    }, [categoryId]);

    // --- Handlers ---
    const handleRowClick = (subCategoryId) => {
        navigate(`/products/${subCategoryId}`);
    };

    const handleCreateSubCategory = async (e) => {
        e.preventDefault();
        if (!newSubCategoryName) {
            return toast.error("Sub Category name is required.");
        }

        setIsCreating(true);
        try {
            const response = await axios.post(`/subcategory/create`, {
                name: newSubCategoryName,
                category: categoryId, // Link this new row to its parent category
            });
            
            if (response.data.success) {
                toast.success("New Sub Category created!");
                // Add the new row to our state to update the UI
                setSubCategories([...subCategories, response.data.subCategory]);
                setIsModalOpen(false); // Close the modal
                setNewSubCategoryName(''); // Reset the form
            }
        } catch (error) {
            console.error("Error creating subcategory:", error);
            toast.error(error.response?.data?.message || "Failed to create row");
        } finally {
            setIsCreating(false);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <>
                <Navbar title="Loading..." />
                <div className='flex justify-center items-center h-64'>
                    <Loader2 className="animate-spin text-[--color-primaryColor]" size={40} />
                </div>
            </>
        );
    }

    return (
        <>
            {/* Pass the fetched category name to Navbar2 */}
            <Navbar title={categoryName || "Sub-Categories"} />
            
            <div className='grid grid-cols-2 px-4 py-2'>
                {/* Map over the subcategories (rows) */}
                {subCategories.map((row) => (
                    <div
                        onClick={() => handleRowClick(row._id)}
                        className='flex flex-col items-center text-center gap-2 bg-white rounded-lg shadow-md p-4 m-2 border-b-4 border-l-2 border-[--color-primaryColor] cursor-pointer transition-transform hover:scale-105'
                        key={row._id}>
                        <div className='p-2 bg-gray-100 rounded-full'>
                            <List className="text-primaryColor" />
                        </div>
                        <h3 className="text-lg font-normal text-black select-none">{row.name}</h3>
                    </div>
                ))}

                {/* "Add New Row" Card */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    className='flex flex-col items-center justify-center text-center gap-2 bg-gray-50 rounded-lg shadow-md p-4 m-2 border-2 border-dashed border-gray-400 cursor-pointer transition-all hover:border-[--color-primaryColor] hover:bg-gray-100'
                >
                    <SquarePlus className="text-gray-500" />
                    <h3 className="text-lg font-normal text-gray-600 select-none">
                        Add New Sub Category
                    </h3>
                </div>
            </div>

            {/* "Add New Row" Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-[--color-primaryColor]">
                                Create New Sub Category
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isCreating}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateSubCategory} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Sub Category Name (Required)
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newSubCategoryName}
                                    onChange={(e) => setNewSubCategoryName(e.target.value)}
                                    disabled={isCreating}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--color-primaryColor]"
                                    placeholder="e.g. Upvc Fitting or Accessories"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full py-2 px-4 rounded-md text-white font-semibold flex items-center justify-center gap-2 transition-colors bg-primaryColor hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Sub Category"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. ADD THE BOTTOM NAV COMPONENT HERE */}
            <BottomNav />
        </>
    );
};

export default SubCategory;




