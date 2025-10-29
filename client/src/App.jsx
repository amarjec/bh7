import React from 'react'
import { useAppContext } from './context/AppContext.jsx';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import SubCategory from './pages/SubCategory.jsx';
import Product from './pages/Product.jsx';
import Customer from './pages/Customer.jsx';
import ViewQuote from './pages/FinalQuotation.jsx';
import History from './pages/History.jsx';
import QuoteDetails from './pages/QuoteDetails.jsx';
import FinalQuotation from './pages/FinalQuotation.jsx';

const App = () => {

  const {user, setUser} = useAppContext();


  const handleLoginSuccess = (userData) => {
    // Update state to reflect the user is logged in
    setUser(userData);
    console.log('User logged in via cookie authentication:', userData);
  };

  // Component to wrap protected routes
  const ProtectedRoute = ({ element }) => {
    return user ? element : <Navigate to="/login" replace />;
  };


  return (
    <div className='w-full h-screen '>
      <Toaster position="top-center" reverseOrder={false} /> {/* Added Toaster back here */}

      <Routes>
        <Route path="/login" element={!user ? (<Login onLoginSuccess={handleLoginSuccess} />) : (<Navigate to="/" replace />)} /> 
        <Route path='/' element={<ProtectedRoute element={<Home />} />} />

        <Route path='/sub-category/:categoryId' element={<ProtectedRoute element={<SubCategory />} />} /> 
        <Route path='/products/:subCategoryId' element={<ProtectedRoute element={<Product />} />} />

        <Route path='/customer' element={<ProtectedRoute element={<Customer />} />} />
        <Route path='/view-quote' element={<ProtectedRoute element={<FinalQuotation />} />} />

        <Route path="/history" element={<History/>} /> {/* <-- 3. Add this route */}
        <Route path="/quote-details/:quoteId" element={<QuoteDetails />} /> {/* <-- 4. Add this route */}
       

        <Route path='*' element={<ProtectedRoute element={<Home />} />} />
      </Routes>
      
    </div>
  )
}

export default App
