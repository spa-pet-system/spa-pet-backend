import express from 'express'
import { env } from '~/config/environment'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { connectDB } from '~/config/database'
// router
import authRoutes from '~/routes/authRoutes'
import customerRoutes from '~/routes/customerRoutes'
import serviceCustomerRoutes from '~/routes/serviceCustomerRoutes'
import petRoutes from '~/routes/petRoutes'
import appointmentRoutes from '~/routes/appointmentRoutes'

// admin
import adminRoutes from './routes/adminRoutes'
import serviceAdminRoutes from './routes/serviceAdminRoutes'
import productAdminRoutes from './routes/productAdminRoutes'  

import cookieParser from 'cookie-parser'
import cors from 'cors'
const morgan = require('morgan')


const START_SERVER = () => {
  const app = express()
  // Enable req.body json data

  app.use(express.json())
  app.use(morgan('dev'))
  app.use(cors({
    origin: 'http://localhost:5173', // React app
    credentials: true // 👈 bắt buộc để gửi cookie
  }))
  app.use(cookieParser())
  app.use(errorHandlingMiddleware) // Middleware xử lý lỗi tập trung

  // user router
  app.use('/api/auth', authRoutes)
  app.use('/api/customer', customerRoutes)
  app.use('/api/admin', adminRoutes )
  app.use('/api/admin', serviceAdminRoutes)
  app.use('/api/admin', productAdminRoutes)
  app.use('/api/customer', serviceCustomerRoutes)
  app.use('/api/customer', petRoutes)
  app.use('/api/customer', appointmentRoutes)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })
}

// Chỉ khi kết nối tới Database thành công thì mới Start Server Back-end lên.
// Immediately-invoked / Anonymous Async Function (IIFE)
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas')
    await connectDB()
    console.log('2. Connected to MongoDB Cloud Atlas')
    //Khơi động Sercer Back-end sau khi Connect DB
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
