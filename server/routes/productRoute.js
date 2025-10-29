import express from 'express';
import userAuth from '../middlewares/userAuthMiddleware.js';
import { createProduct, getProductsForList, getProductsForSubCategory } from '../controllers/productController.js';

const productRouter = express.Router();

// All routes are protected
productRouter.use(userAuth);

// POST /api/product/create
productRouter.post('/create', createProduct);

// GET /api/product/get-for-subcategory/:subCategoryId
productRouter.post('/get-for-subcategory/:subCategoryId', getProductsForSubCategory);

//for view-quote
// POST /api/product/get-details-for-list
productRouter.post('/get-details-for-list', getProductsForList); //

export default productRouter;

