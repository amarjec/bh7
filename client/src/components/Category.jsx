import React, { useState, useEffect } from 'react';
import { SquarePlus, X, Loader2 } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';


const Category = () => {
    const { navigate, axios, } = useAppContext();

    // --- State Management ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    
    // State for the new category form
    const [newCategory, setNewCategory] = useState({ name: '', desc: '' });
    const [isCreating, setIsCreating] = useState(false);

    const [loading, setLoading] = useState(true); 

    // for category page
    const [categories, setCategories] = useState([]);
   
  

//------------------------------------------------------------------------------------------------//
     // --- Data Fetching ---
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/category/get-all`);
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error(error.response?.data?.message || "Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // --- Handlers ---
    const handleProductClick = (_id) => {
        navigate(`/sub-category/${_id}`);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewCategory(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.name) {
            return toast.error("Category name is required.");
        }

        setIsCreating(true);
        try {
            const response = await axios.post(`/category/create`, newCategory);
            if (response.data.success) {
                toast.success("Category created!");
                setCategories([...categories, response.data.category]); // Optimistic update
                setIsModalOpen(false); // Close modal
                setNewCategory({ name: '', desc: '' }); // Reset form
            }
        } catch (error) {
            console.error("Error creating category:", error);
            toast.error(error.response?.data?.message || "Failed to create category");
        } finally {
            setIsCreating(false);
        }
    };

    // --- Render Logic ---
    if (loading) {
        return (
            <div className='flex justify-center items-center h-48'>
                <Loader2 className="animate-spin text-[--color-primaryColor]" size={40} />
            </div>
        );
    }

    return (
        <>
            <div className='grid grid-cols-2 px-4 py-2 '>
                {/* Map over categories from state */}
                {categories.map((item) => (
                    <div
                        onClick={() => handleProductClick(item._id)}
                        className='flex flex-col items-center text-center gap-2 bg-white rounded-lg shadow-md p-4 m-2 border-b-4 border-l-2 border-[--color-primaryColor] cursor-pointer transition-transform hover:scale-105'
                        key={item._id}>
                        <div className='p-2 bg-gray-100 rounded-full'>
                            <SquarePlus className="text-[--color-primaryColor]" />
                        </div>
                        <h3 className="text-lg font-normal text-black select-none">{item.name}</h3>
                        <p className='text-xs font-light opacity-60 select-none'>
                            {item.desc || "No description"}
                        </p>
                    </div>
                ))}

                {/* "Add New" Card */}
                <div
                    onClick={() => setIsModalOpen(true)}
                    className='flex flex-col items-center justify-center text-center gap-2 bg-gray-50 rounded-lg shadow-md p-4 m-2 border-2 border-dashed border-gray-400 cursor-pointer transition-all hover:border-[--color-primaryColor] hover:bg-gray-100 mb-20'
                >
                    <SquarePlus className="text-gray-500" />
                    <h3 className="text-lg font-normal text-gray-600 select-none">
                        Add New Category
                    </h3>
                </div>
            </div>

            {/* "Add New Category" Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-[--color-primaryColor]">
                                Create New Category
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isCreating}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateCategory} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name (Required)
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newCategory.name}
                                    onChange={handleFormChange}
                                    disabled={isCreating}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--color-primaryColor]"
                                    placeholder="e.g. Light Fitting"
                                />
                            </div>
                            <div>
                                <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="desc"
                                    name="desc"
                                    value={newCategory.desc}
                                    onChange={handleFormChange}
                                    disabled={isCreating}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[--color-primaryColor]"
                                    placeholder="e.g. Create a new Quotation"
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
                                    "Create Category"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Category;

