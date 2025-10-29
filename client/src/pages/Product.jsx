import React, { useState, useEffect, useMemo } from 'react';
import { useParams, } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, X, Plus, Save } from 'lucide-react';
import Navbar from '../components/Navbar.jsx'; 
import AddProductModal from '../components/AddProductModal.jsx';



const Product = () => {
    // This gets the 'subCategoryId' (e.g., for "CPVC Fitting") from the URL
    const { subCategoryId } = useParams();
    const { navigate, list, setList } = useAppContext();

    // --- State Management ---
    const [subCategoryName, setSubCategoryName] = useState(''); // For the title
    const [products, setProducts] = useState([]); // Master list of products
    const [quantities, setQuantities] = useState({}); // { productId: quantity }

    // Modal States
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- Data Fetching ---
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch the SubCategory name for the title
            const subCategoryRes = await axios.get(`/subcategory/get/${subCategoryId}`);
            setSubCategoryName(await subCategoryRes.data.subCategory.name);

            // 2. Fetch products using the POST route,
            const productRes = await axios.post(
                `/product/get-for-subcategory/${subCategoryId}`, 
            );
            
            const fetchedProducts = productRes.data.products;
            setProducts(fetchedProducts);

            // --- NEW LOGIC: Initialize local quantities from global list ---
            const initialQuantities = {};
            fetchedProducts.forEach(p => {
                // If this product's ID is in the global 'list'
                if (list[p._id]) {
                    // Set it in our local 'initialQuantities' object
                    initialQuantities[p._id] = list[p._id];
                }
            });
            // Set the local 'quantities' state
            setQuantities(initialQuantities);
            // --- END NEW LOGIC ---
            
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error(error.response?.data?.message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    // Fetch data on initial page load (in public mode)
    useEffect(() => {
        if (subCategoryId) {
            fetchData();
        }
    }, [subCategoryId]);



    // --- Product & Quantity Handlers ---
    const handleCreateProduct = async (newProductData) => {
        setIsCreating(true);
        try {
            const response = await axios.post(`/product/create`, {
                ...newProductData,
                subCategory: subCategoryId,
            });
            
            if (response.data.success) {
                toast.success("Product created!");
                // Add the new product to our list
                // The new product will have costPrice = price set by the backend
                setProducts([...products, response.data.product]);
                setIsProductModalOpen(false);
            }
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error(error.response?.data?.message || "Failed to create product");
        } finally {
            setIsCreating(false);
        }
    };

    const handleQuantityChange = (productId, value) => {
        const numValue = Number(value);
        setQuantities(prev => ({
            ...prev,
            [productId]: numValue >= 0 ? numValue : 0,
        }));
    };

     // --- Calculation ---
    const totals = useMemo(() => {
        let totalSellingPrice = 0;

        products.forEach(p => {
            const qty = quantities[p._id] || 0;
            if (qty > 0) {
                totalSellingPrice += p.sellingPrice * qty;
            }
        });

        return { totalSellingPrice};
    }, [products, quantities]);
    
    // --- Save Quotation ---
    const handleSaveQuotation = () => {
        
        setList(prevGlobalList => {
            // 1. Make a copy of the current global list
            const updatedList = { ...prevGlobalList };

            // 2. Loop through all the products on the CURRENT page (in local 'quantities' state)
            Object.keys(quantities).forEach(productId => {
                const localQuantity = quantities[productId];

                if (localQuantity > 0) {
                    // 3. If quantity > 0, add or update it in the list
                    updatedList[productId] = localQuantity;
                } else {
                    // 4. If quantity is 0, DELETE it from the list
                    //    (This removes it if it was saved from a previous session)
                    delete updatedList[productId];
                }
            });

            // 5. Return the new, clean list
            return updatedList;
        });

        toast.success("Quotation updated!", { duration: 1000 });
        navigate(-1); // Go back
    };

    // --- Render ---
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
        <div className="pb-48"> {/* Add padding for the sticky footer */}
            <Navbar title={subCategoryName || "Products"} />

            {/* --- Product List Header --- */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-100 sticky top-16 z-10 font-medium text-xs text-gray-600">
                <div className="col-span-4">Product</div>
                <div className="col-span-2">S.Price</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Total</div>
            </div>

            {/* --- Product List --- */}
            <div className="p-2">
                {products.length === 0 ? (
                    <p className="text-center text-gray-500 mt-8">No products added yet. Click the "+" button to start.</p>
                ) : (
                    products.map(p => {
                        const qty = quantities[p._id] || 0;
                        const total = p.sellingPrice * qty;
                        
                        return (
                            <div 
                                key={p._id} 
                                className="grid grid-cols-12 gap-2 items-center p-2 border-b"
                            >
                                <div className="col-span-4 text-sm font-medium">{p.label}</div>
                                <div className="col-span-2 text-sm">₹{p.sellingPrice}</div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        value={qty === 0 ? '' : qty}
                                        onChange={(e) => handleQuantityChange(p._id, e.target.value)}
                                        className="w-full p-1.5 border rounded-md text-center"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="col-span-2 text-sm font-semibold text-right">₹{total.toFixed(0)}</div>
                            </div>
                        );
                    })
                )}
            </div>
            
            {/* --- Add Product FAB --- */}
            <button
                onClick={() => setIsProductModalOpen(true)}
                className="fixed bottom-28 right-5 z-20 p-4 bg-primaryColor text-white rounded-full shadow-lg"
                aria-label="Add new product"
            >
                <Plus size={28} />
            </button>

            {/* --- Sticky Footer Totals Bar --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t-2 z-10 px-4 pb-4 pt-2">
                <div className="flex justify-between items-center mb-1">
                    <div className="text-sm font-medium text-gray-600">
                        Total Price:
                    </div>
                    <div className="text-lg font-bold text-[--color-primaryColor]">
                        {`₹${totals.totalSellingPrice.toFixed(2)}`}
                    </div>
                </div>

                <button
                    onClick={handleSaveQuotation}
                    // disabled={totals.totalSellingPrice === 0}
                    className="w-full py-3 px-4 rounded-md text-white font-semibold text-lg flex items-center justify-center gap-2
                                transition-all duration-300 ease-in-out
                                bg-secondaryColor hover:bg-amber-600
                                disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <Save size={20} />
                    Save & Go Back
                </button>
            </div>

            {/* --- Add Product Modal --- */}
            <AddProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={handleCreateProduct}
                isCreating={isCreating}
            />
        </div>
    );
};




export default Product;
