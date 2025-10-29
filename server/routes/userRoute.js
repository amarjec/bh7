import express from 'express'
import { getUserProfile, logoutUser, sendOtp, verifyOtpAndLogin, updateUserDetails, useQuoteCredit} from '../controllers/userController.js';
import userAuth from '../middlewares/userAuthMiddleware.js';

const userRouter = express.Router();

// --- Auth Routes (No auth middleware needed) ---
userRouter.post('/send-otp', sendOtp);
userRouter.post('/verify-otp', verifyOtpAndLogin);

// --- User Routes (Auth middleware required) ---
userRouter.post('/logout', userAuth, logoutUser);
userRouter.get('/profile', userAuth, getUserProfile);

// 2. Add the new route for updating details
userRouter.post('/update-details', userAuth, updateUserDetails);

// POST /api/user/use-credit
userRouter.post('/use-credit', userAuth, useQuoteCredit);


export default userRouter;