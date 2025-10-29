import express from 'express';
import { createQuote, getMyQuotes, getQuoteById } from '../controllers/quoteController.js';
import userAuth from '../middlewares/userAuthMiddleware.js';

const quoteRouter = express.Router();

// Protect all routes
quoteRouter.use(userAuth);

// POST /api/quote/create
quoteRouter.post('/create', createQuote);

// GET /api/quote/get-my-quotes
quoteRouter.get('/get-my-quotes', getMyQuotes);

// for history page to view single quote
// GET /api/quote/:id 
quoteRouter.get('/:id', getQuoteById);

export default quoteRouter;