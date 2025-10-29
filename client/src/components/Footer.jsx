import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext'; // Contains 'navigate'
import { Home, Store, ClipboardList, Star } from 'lucide-react';

/**
 * A simple navigation footer for top-level pages.
 */
const Footer = () => {
    const { navigate } = useAppContext();
    const location = useLocation();
    const currentPath = location.pathname;

    // --- Helper Array for Links ---
    // This makes it easy to add or change links later.
    const navLinks = [
        { name: 'Home', icon: Home, path: '/home' },
        { name: 'Shop', icon: Store, path: '/categories' }, // Links to your main categories page
        { name: 'My Quotes', icon: ClipboardList, path: '/history' },
        { name: 'Pro', icon: Star, path: '/pro' }, // For your future page
    ];

    /**
     * Returns the styling for a link based on whether it's active.
     */
    const getLinkClass = (path) => {
        const isActive = currentPath === path;
        return isActive
            ? 'text-primaryColor' // Active link color
            : 'text-gray-500 hover:text-gray-700'; // Inactive link color
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white shadow-inner border-t">
            <div className="grid grid-cols-4 gap-2 h-16">
                
                {navLinks.map((link) => (
                    <button
                        key={link.name}
                        type="button"
                        onClick={() => navigate(link.path)}
                        // Apply active/inactive styles
                        className={`flex flex-col items-center justify-center transition-colors duration-200 ${getLinkClass(link.path)}`}
                    >
                        <link.icon size={24} />
                        <span className="text-xs font-medium">{link.name}</span>
                    </button>
                ))}

            </div>
        </footer>
    );
};

export default Footer;