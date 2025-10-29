import express from 'express';
import { createCategory, getAllCategories, getCategoryById } from '../controllers/categoryController.js';
import userAuth from '../middlewares/userAuthMiddleware.js'; // Your auth middleware

const categoryRouter = express.Router();

// --- All routes are protected ---
// This ensures only logged-in users can create or view categories
categoryRouter.use(userAuth);

// POST /api/category/create
categoryRouter.post('/create', createCategory);

// GET /api/category/get-all
categoryRouter.get('/get-all', getAllCategories);
categoryRouter.get('/get/:id', getCategoryById);

export default categoryRouter;

