import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import cron from 'node-cron';
import connectDB from './configs/MongoDB.js';
import userRouter from './routes/userRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import subCategoryRouter from './routes/subCategoryRoute.js';
import productRouter from './routes/productRoute.js';
import customerRouter from './routes/customerRoute.js';
import quoteRouter from './routes/quoteRoute.js';

const app = express();

const PORT = process.env.PORT || 8080;
await connectDB();

const allowedOrigin = ['http://localhost:5173'];

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigin, credentials: true}));

app.get ('/', (req, res) => {
    res.send('Your sever is running')
})

//API Routes
app.use('/api/user', userRouter)
app.use('/api/category', categoryRouter);
app.use('/api/subcategory', subCategoryRouter); 
app.use('/api/product', productRouter);  
app.use('/api/customer', customerRouter); 
app.use('/api/quote', quoteRouter);  




app.listen(PORT, () => {
    console.log(`Your server is running on http://localhost:${PORT}`);
})
export default app;



