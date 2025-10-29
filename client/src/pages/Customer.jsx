import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, X, Plus, User, Search, Home, Phone } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

const Customer = () => {
    const { navigate, setSelectedCustomer } = useAppContext();

    // --- State Management ---
    const [customers, setCustomers] = useState([]); // List of existing customers
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Modal States ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    
    // --- New Customer Form State ---
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [number, setNumber] = useState('');

    // --- Data Fetching ---
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/customer/get-my-customers');
            setCustomers(res.data.customers);
            setFilteredCustomers(res.data.customers); // Initialize filtered list
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast.error(error.response?.data?.message || "Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // --- Search Filtering ---
    useEffect(() => {
        const results = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCustomers(results);
    }, [searchTerm, customers]);

    // --- Handlers ---
    
    /**
     * This function is called when a user is created OR selected.
     * It saves the customer to context and moves to the next page.
     */
    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        navigate('/view-quote'); 
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        if (!name) return toast.error("Customer name is required.");

        if(number.startsWith(0) || number.startsWith(1) || number.startsWith(2) || number.startsWith(3) || number.startsWith(4) || number.startsWith(5)) {
            return toast.error("Number is Invalid!")
        }

        if (number.length !== 10) {
            return toast.error("Custmer number must be 10-digit.")
        }
        

        setIsCreating(true);
        try {
            const res = await axios.post('/customer/create', { name, address, number });
            if (res.data.success) {
                toast.success("Customer created!");
                const newCustomer = res.data.customer;
                
                // Add to state and reset form
                setCustomers([newCustomer, ...customers]);
                setIsModalOpen(false);
                setName('');
                setAddress('');
                setNumber('');

                // Automatically select this new customer and proceed
                handleCustomerSelect(newCustomer);
            }
        } catch (error) {
            console.error("Error creating customer:", error);
            toast.error(error.response?.data?.message || "Failed to create customer");
        } finally {
            setIsCreating(false);
        }
    };

    // --- Render ---
    if (loading) {
        return (
            <>
                <Navbar title="Loading Customers..." />
                <div className='flex justify-center items-center h-64'>
                    <Loader2 className="animate-spin text-[--color-primaryColor]" size={40} />
                </div>
            </>
        );
    }

    return (
        <div className="pb-24"> {/* Padding for the FAB */}
            <Navbar title="Select or Add Customer" />

            {/* --- Search Bar --- */}
            <div className="p-4 sticky top-16 bg-white z-10">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by name or number or address.."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 border rounded-lg"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
            </div>

            {/* --- Customer List --- */}
            <div className="p-2">
                {filteredCustomers.length === 0 ? (
                    <p className="text-center text-gray-500 mt-8">
                        {customers.length === 0 ? "No customers found. Add one!" : "No customers match your search."}
                    </p>
                ) : (
                    filteredCustomers.map(cust => (
                        <div
                            key={cust._id}
                            onClick={() => handleCustomerSelect(cust)}
                            className="bg-white rounded-lg shadow-md p-4 m-2 border-l-4 border-primaryColor cursor-pointer transition-all hover:shadow-lg hover:bg-green-50"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <User className="text-primaryColor" size={20} />
                                <h3 className="text-lg font-semibold">{cust.name}</h3>
                            </div>
                            {cust.number && (
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone size={16} />
                                    <span>{cust.number}</span>
                                </div>
                            )}
                            {cust.address && (
                                <div className="flex items-start gap-3 text-gray-600 mt-1">
                                    <Home size={16} className="mt-1" />
                                    <span>{cust.address}</span>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            {/* --- Add Customer FAB --- */}
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-28 right-5 z-20 p-4 bg-primaryColor text-white rounded-full shadow-lg"
                aria-label="Add new customer"
            >
                <Plus size={28} />
            </button>

            {/* --- Add Customer Modal --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-primaryColor">
                                Add New Customer
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isCreating}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateCustomer} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Required)</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="e.g. John Doe"
                                    disabled={isCreating}
                                />
                            </div>
                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Required)</label>
                                <input
                                    type="tel"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="e.g. 9876543210"
                                    maxLength={10}
                                    disabled={isCreating}
                                />
                            </div>
                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="e.g. 123 Main St"
                                    rows="3"
                                    disabled={isCreating}
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full py-3 px-4 rounded-md text-white font-semibold flex items-center justify-center gap-2 transition-colors bg-primaryColor hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Creating...
                                    </>
                                ) : (
                                    "Create & Select Customer"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customer;