import { Loader2, X } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';



const AddProductModal = ({ isOpen, onClose, onSubmit, isCreating }) => {
    const [label, setLabel] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [unit, setUnit] = useState('pcs');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!label || !sellingPrice || !costPrice) {
            return toast.error("Product name and price are required.");
        }
        onSubmit({ label, sellingPrice: Number(sellingPrice), costPrice: Number(costPrice), unit });
        // Clear form
        setLabel('');
        setSellingPrice('');
        setCostPrice('');
        setUnit('pcs');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primaryColor">Add New Product</h2>
                    <button onClick={onClose} disabled={isCreating} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                            placeholder="e.g. Pillar Cock"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                            <input
                                type="number"
                                value={sellingPrice}
                                onChange={(e) => setSellingPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                                placeholder="0"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Unit</label>
                            <input
                                type="text"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                                placeholder="pcs"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₹)</label>
                            <input
                                type="number"
                                value={costPrice}
                                onChange={(e) => setCostPrice(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryColor"
                                placeholder="0"
                            />
                        </div>
                        
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full py-2 px-4 rounded-md text-white font-semibold flex items-center justify-center gap-2 transition-colors bg-primaryColor hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {isCreating ? <Loader2 className="animate-spin" size={20} /> : "Save Product"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal
