import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Smartphone, Lock, User, Home, ArrowRight, RotateCcw, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';

const Login = ({ onLoginSuccess }) => {

  const {axios, loading, setLoading} = useAppContext();
    // --- State Management ---
    const [formData, setFormData] = useState({
        number: '',
        otp: '',
        name: '',
        address: '',
        pin: ''
    });
    
    // 'sendOtp' | 'verifyOtp' | 'updateDetails'
    const [step, setStep] = useState('sendOtp');

    // --- Utility Handlers ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const changeNumber = () => {
        setFormData(prev => ({ ...prev, otp: '' })); // Clear OTP
        setStep('sendOtp');
    };

    // --- API Handlers ---

    // 1. First Step: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (formData.number.length !== 10) {
            return toast.error('Please enter a valid 10-digit mobile number.');
        }

        setLoading(true);
        const toastId = toast.loading('Sending OTP...');
        try {
            const response = await axios.post("/user/send-otp", {
                number: formData.number,
            });

            toast.success(response.data.message || 'OTP sent successfully!', { id: toastId });
            setStep('verifyOtp');

        } catch (err) {
            console.error('Send OTP Error:', err);
            toast.error(err.response?.data?.message || 'Failed to send OTP.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };
    
    // 1b. Resend OTP (while on verify screen)
    const handleResendOtp = async () => {
        setLoading(true);
        const toastId = toast.loading('Resending OTP...');
        try {
            await axios.post(`/user/send-otp`, {
                number: formData.number,
            });
            toast.success('A new OTP has been sent.', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend OTP.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };


    // 2. Second Step: Verify OTP and Login
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (formData.otp.length !== 6) {
            return toast.error('Please enter the 6-digit OTP.');
        }

        setLoading(true);
        const toastId = toast.loading('Verifying OTP...');
        try {
            const response = await axios.post(`/user/verify-otp`, {
                number: formData.number,
                otp: formData.otp,
            });

            const { user, isNewUser, message } = response.data;
            
            // The 'token' is now automatically set in the browser as a cookie.
            
            if (isNewUser) {
                // NEW USER: Proceed to update details step
                toast.success('Login successful! Please complete your profile.', { id: toastId });
                setStep('updateDetails');
            } else {
                // EXISTING USER: Login is complete
                toast.success(message || 'Welcome back!', { id: toastId });
                onLoginSuccess(user); // Pass user data to App.js
            }

        } catch (err) {
            console.error('Verify OTP Error:', err);
            toast.error(err.response?.data?.message || 'Invalid or expired OTP.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // 3. Third Step (Conditional): Update User Details
    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            return toast.error('Please enter your shop name.');
        }
        if (!formData.address) {
            return toast.error('Please enter your shop address.');
        }
        if (!formData.pin && formData.pin.length !== 4) {
            return toast.error('Please create a 4-digit pin.');
        }
        if(formData.pin.startsWith('0')  ) {
            return toast.error('Please create a strong pin.');
        }
        

        setLoading(true);
        const toastId = toast.loading('Saving profile...');
        try {
            const response = await axios.post(`/user/update-details`, {
                name: formData.name,
                address: formData.address,
                pin: formData.pin,
            });
            
            // This request was authenticated using the cookie.
            const { user, message } = response.data;
            toast.success(message || 'Profile saved!', { id: toastId });
            onLoginSuccess(user); // NOW the login flow is complete
            
        } catch (err) {
            console.error('Update Details Error:', err);
            toast.error(err.response?.data?.message || 'Failed to save profile.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };


    // --- Render Functions for Each Step ---

    const renderSendOtp = () => (
        <form onSubmit={handleSendOtp} className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-[--color-primaryColor]">
                Login or Sign Up
            </h2>
            <p className="text-center text-gray-600">
                Enter your mobile number to get an OTP.
            </p>
            
            <Input
                Icon={Smartphone} // 2. Updated icon component
                type="tel"
                name="number"
                placeholder="10-digit mobile number"
                value={formData.number}
                onChange={handleChange}
                maxLength={10}
                disabled={loading}
            />
            
            <Button
                Icon={ArrowRight} // 2. Updated icon component
                text="Get OTP"
                loadingText="Sending..."
                isLoading={loading}
            />
        </form>
    );

    const renderVerifyOtp = () => (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-[--color-primaryColor]">
                Verify OTP
            </h2>
            <p className="text-center text-gray-600">
                Enter the 6-digit OTP sent to <br/>
                <strong className="text-[--color-textColor]">{formData.number}</strong>
            </p>
            
            <Input
                Icon={Lock} // 2. Updated icon component
                type="text"
                name="otp"
                placeholder="6-digit OTP"
                value={formData.otp}
                onChange={handleChange}
                maxLength={6}
                disabled={loading}
                className="tracking-[0.5em] text-center"
            />
            
            <Button
                Icon={ArrowRight} // 2. Updated icon component
                text="Verify & Login"
                loadingText="Verifying..."
                isLoading={loading}
            />

            <div className='flex justify-between items-center pt-2'>
                <button 
                    type="button" 
                    onClick={changeNumber}
                    disabled={loading}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-[--color-textColor] transition-colors"
                >
                    <Edit2 size={14} /> {/* 2. Updated icon component */}
                </button>
                
                <button 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="flex items-center gap-1 text-sm font-medium text-[--color-primaryColor] hover:text-green-800 transition-colors"
                >
                    <RotateCcw size={14} /> {/* 2. Updated icon component */}
                </button>
            </div>
        </form>
    );
    
    const renderUpdateDetails = () => (
        <form onSubmit={handleUpdateDetails} className="space-y-6">
            <h2 className="text-3xl font-bold text-center text-[--color-primaryColor]">
                Complete Your Profile
            </h2>
            <p className="text-center text-gray-600">
                Welcome! Let's get you set up.
            </p>
            
            <Input
                Icon={User} // 2. Updated icon component
                type="text"
                name="name"
                placeholder="Your Shop Name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
            />
            
            <Input
                Icon={Home} // 2. Updated icon component
                type="text"
                name="address"
                placeholder="Your Shop Address"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
            />
            <Input
                Icon={Lock} // 2. Updated icon component
                type="text"
                name="pin"
                placeholder="Create a 4-digit pin"
                maxLength={4}
                value={formData.pin}
                onChange={handleChange}
                disabled={loading}
            />
            
            <Button
                Icon={ArrowRight} // 2. Updated icon component
                text="Save & Continue"
                loadingText="Saving..."
                isLoading={loading}
            />
            <p className='text-xs font-medium text-gray-900 opacity-50 text-center'>For security, please choose a 4-digit pin that does not begin with 0.</p>
        </form>
        
    );
    
    // --- Main Render ---
    return (
        <div className="min-h-screen bg-bgColor flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white shadow-2xl rounded-lg p-8 transition-all">
                {step === 'sendOtp' && renderSendOtp()}
                {step === 'verifyOtp' && renderVerifyOtp()}
                {step === 'updateDetails' && renderUpdateDetails()}
            </div>
        </div>
    );
};

// --- Reusable Sub-components ---

const Input = ({ Icon, type, name, placeholder, value, onChange, maxLength, disabled, className = '' }) => (
    <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
        </span>
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            maxLength={maxLength}
            disabled={disabled}
            required
            className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-lg text-textColor
                        focus:outline-none focus:ring-2 focus:ring-primaryColor focus:border-transparent
                        disabled:bg-gray-100 ${className}`}
        />
    </div>
);

const Button = ({ Icon, text, loadingText, isLoading }) => (
    <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-md text-white font-semibold text-lg flex items-center justify-center gap-2
                    transition-all duration-300 ease-in-out
                    ${isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primaryColor hover:bg-green-700'
                    }`}
    >
        {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {loadingText}
            </>
        ) : (
            <>
                {text}
                <Icon size={20} />
            </>
        )}
    </button>
);

export default Login;