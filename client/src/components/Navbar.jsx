import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { useAppContext } from '../context/AppContext.jsx'

const Navbar = ({title}) => {
    const {navigate} = useAppContext();
    
    const displayTitle = title || "Loading...";

  return (
    <div className='bg-primaryColor shadow-sm p-4 sticky top-0 z-10 '>
             <ArrowLeft onClick={()=> navigate(-1)} className='text-white absolute font-semibold cursor-pointer'/>
             <div className='flex items-center justify-center'>
               <h1 className="relative text-md font-semibold text-white text-center select-none">{displayTitle}</h1>
             </div>
    </div>
  )
}

export default Navbar
