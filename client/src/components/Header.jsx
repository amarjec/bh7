import React, { useCallback, useState } from 'react'
import {Eye, EyeOff, Store} from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';


const Header = () => {

    const {user, navigate, } = useAppContext();

    const[privateView, setPrivateView] = useState(false); // Deleted or moved to appcontext in future version.


  return (
    <div className="bg-white shadow-sm  p-4 sticky top-0 z-10">
        <div className="mx-auto flex items-center justify-between ">

            <div className='max-w-50 '>  
                <div 
                onClick={() => navigate('/')}
                className='flex items-center gap-1 cursor-pointer'>
                    <Store className='text-primary h-5 w-5'/>
                    <h1 className="relative text-md text-primary font-bold select-none">{user?.name || 'Billing Habit'}</h1>  
                </div>
                <p className='font-light opacity-50 text-xs leading-3 select-none'>{user?.address}</p>
            </div>

            <div className='max-w-40 flex items-center gap-4'>
            <div className=''>
                <div className=' bg-blue-100 rounded-md overflow-hidden flex items-center justify-center px-3 py-1.5'>
                    <button className='text-xs font-light select-none'>Credit: {user?.credit}</button>
                </div>  
            </div>

            <div className='max-w-20 '>
                <div 
                className='bg-gray-100 select-none rounded-md overflow-hidden flex items-center justify-center px-1.5 py-1 cursor-pointer'> 
                    {privateView ? (
                        <Eye className='w-5 h-5' />
                    ) : (   
                        <EyeOff className='w-5 h-5' />
                    )}
                </div>    
            </div>
            </div>
        </div>
    </div>
  )
}

export default Header
