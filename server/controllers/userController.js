import transporter from "../configs/nodemailer.js";
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'


const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
};

// --- Utility: Generate a 6-digit OTP ---
const generateOtp = () => {
    // Generate a random 6-digit number
    return Math.floor(100000 + Math.random() * 900000).toString();
};



// --- 1. Handler to Send OTP for Login/Signup ---
export const sendOtp = async (req, res) => {
    const { number } = req.body; // Input variable name

    // 1. Basic Input Validation
    if (!number || number.length !== 10) {
        return res.status(400).json({ success: false, message: 'Invalid Mobile Number.' });
    }

    try {
        const otp = generateOtp();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

        // 2. Find or Create User and Save OTP
        let user = await userModel.findOne({ number }); 

        if (!user) {
            // User does not exist, create a new one (Signup)
            user = await userModel.create({
                number, 
                otp,
                otpExpiry,
                // Add default profile info here if needed
            });
        } else {
            // User exists, update OTP (Login)
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
        }

        // 3. Send OTP via SMS Service
        // console.log(`[OTP SENT] to ${number}: ${otp}`);
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: process.env.ADMIN_MAIL,
            subject: `${number} is ${otp}`,
            text: `Welcome to Billing Habit. Your login otp for ${number} is ${otp}`,
        }
        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            success: true, 
            message: 'OTP sent successfully. Please check your phone.',
        });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Server error during OTP generation.' });
    }
};

// --- 2. Handler to Verify OTP and Issue Token (Updated) ---
export const verifyOtpAndLogin = async (req, res) => {
    const { number, otp } = req.body;

    // 1. Basic Validation
    if (!number || !otp) {
        return res.status(400).json({ success: false, message: 'Mobile number and OTP are required.' });
    }

    try {
        // 2. Find the user by mobile number
        const user = await userModel.findOne({ number }); 

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // 3. Check OTP validity and expiry
        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        // 4. Verification successful: Clear OTP and generate JWT token
        user.otp = undefined;
        user.otpExpiry = undefined;
        
        // --- NEW LOGIC START ---
        // Check if this is a new user (i.e., they haven't set a name yet)
        // We also set isVerified to true on first successful login
        let isNewUser = false;
        if (!user.isVerified) {
            user.isVerified = true;
            isNewUser = true; 
        }
        // --- NEW LOGIC END ---

        await user.save(); // Clean up OTP fields and save isVerified

        const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.cookie('token', token, cookieOptions); 

        // 5. Respond with token and user data
        res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                _id: user._id,
                number: user.number,
                name: user.name, // Send existing name if available
            },
            isNewUser: isNewUser // Send the new user flag to the frontend
        });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Server error during verification.' });
    }
};

// --- 3. Handler to Add/Update User Details (for New Users) ---
export const updateUserDetails = async (req, res) => {
    const { name, address, pin } = req.body;
    const userId = req.userId; // Assuming auth middleware provides this

    // 1. Validation
    // We make 'name' required at this step, but 'address' is optional
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    if (!userId) {
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    if (!pin) {
        return res.status(401).json({ success: false, message: "Create 4-digit pin." });
    }
    if (pin.length !== 4) {
        return res.status(401).json({ success: false, message: "Create 4-digit pin." });
    }

    try {
        // 2. Find the user
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // 3. Update details
        user.name = name;
        if (address) {
            user.address = address; // Only update address if provided
        }
        user.pin = pin;

        await user.save();

        // 4. Send back the updated user
        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                _id: user._id,
                number: user.number,
                name: user.name,
                address: user.address,
                pin: user.pin,
            }
        });

    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ success: false, message: 'Server error during profile update.' });
    }
};


export const getUserProfile = async (req, res) => {
    try {
        // This function relies on a middleware (like userAuth) to attach the user ID to the request object.
        // It checks if a user is authenticated by verifying that the user ID exists on the request object.
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "User not authenticated." });
        }
        
        const user = await userModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Something went wrong." });
    }
};


// --- NEW FUNCTION: Use one quote credit ---
export const useQuoteCredit = async (req, res) => {
    const userId = req.userId; // From userAuth middleware

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Server-side check
        if (user.credit <= 0) {
            return res.status(403).json({ success: false, message: "You have no credits left." });
        }

        // Deduct credit and save
        user.credit -= 1;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Credit used.",
            newCredit: user.credit, // Send back the new total
        });

    } catch (error) {
        console.error("Error using credit:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

export const logoutUser = async (req, res) => {
    try {
        // Clear the 'token' cookie from the client's browser
        res.clearCookie('token');

        // Send a success response
        return res.status(200).json({
            success: true,
            message: "User logged out successfully."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong during logout." });
    }
};



// NEW function specifically for the automated job
export const runUserCleanupJob = async ()=> {
    try {
        console.log('Starting scheduled cleanup of unverified users...');
        
        // Calculate the date and time 24 hours ago
        const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const query = {
            isVerified: false,
            createdAt: { $lt: cutoffDate }
        };

        const result = await userModel.deleteMany(query);

        console.log(`Cleanup job finished. Deleted ${result.deletedCount} users.`);

    } catch (error) {
        console.error("Error running user cleanup job:", error);
    }
}