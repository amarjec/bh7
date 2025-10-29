import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// --- Axios Configuration ---
axios.defaults.withCredentials = true; // to send cookies with requests
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

// --- Context Creation ---
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    // This is the global state for your quotation list
    // It will store data like: { "productId1": 2, "productId2": 5 }
    const [list, setList] = useState({});

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    
    // --- Router and User State ---
    const navigate = useNavigate();
    const location = useLocation(); 

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    
    
   
  

    //------------------------------------------------------------------------------------------------//

    // --- Session Check on App Load ---
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                // Attempt to fetch the user profile
                const response = await axios.get("/user/profile");
                
                if (response.data.success) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                // Any error (e.g., 401 Unauthorized) means no valid session
                console.log('No active session found or token expired.');
                setUser(null);
            } finally {
                // We're done checking, stop loading
                setLoading(false);
            }
        };

        checkUserSession();
    }, []); // The empty array [] ensures this runs only ONCE on mount

    // --- Auth Functions ---
    const logout = useCallback(async () => {
        try {
            await axios.post("/user/logout");
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Always clear user state on client-side
            setUser(null);
        }
    }, []); // No dependencies needed

   

    // --- Memoized Context Value ---
    const value = useMemo(() => ({
        axios,
        navigate,
        location,
        logout, 

        user, setUser, 
        loading, setLoading,
        list, setList,
        selectedCustomer, setSelectedCustomer,



        
       
    }), [
        axios, navigate, location, user, loading, logout, list, selectedCustomer, 
      
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
