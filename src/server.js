import express from 'express';
import { env } from '~/config/environment';
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware';
import { connectDB } from '~/config/database';
import authRoutes from '~/routes/authRoutes';
import customerRoutes from '~/routes/customerRoutes';
import productRoutes from '~/routes/productRoutes'; // 👈 THÊM VÀO
import cartRoutes from './routes/cartRoutes.js';;
import cookieParser from 'cookie-parser';
import cors from 'cors';

const START_SERVER = () => {
  const app = express();

  app.use(express.json());
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
  app.use(cookieParser());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/customer', customerRoutes);
  app.use('/api/products', productRoutes); // 👈 THÊM VÀO
  
  app.use('/api/cart', cartRoutes);
  app.use(errorHandlingMiddleware);

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`);
  });
};

(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas');
    await connectDB();
    console.log('2. Connected to MongoDB Cloud Atlas');
    START_SERVER();
  } catch (error) {
    console.error(error);
    process.exit(0);
  }
})();
