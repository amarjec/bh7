import express from 'express';
import { createCustomer, getMyCustomers } from '../controllers/customerController.js';
import userAuth from '../middlewares/userAuthMiddleware.js';

const customerRouter = express.Router();

// --- Protect all customer routes ---
// Every route defined below will require the user to be logged in
customerRouter.use(userAuth);

// POST /api/customer/create
customerRouter.post('/create', createCustomer);

// GET /api/customer/get-my-customers
customerRouter.get('/get-my-customers', getMyCustomers);

export default customerRouter;