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

// product
import productRoutes from '~/routes/productRoutes'
import cartRoutes from './routes/cartRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

import cookieParser from 'cookie-parser'
import cors from 'cors'
const morgan = require('morgan')
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'


const START_SERVER = () => {
  const app = express()

  app.use(express.json())
  app.use(morgan('dev'))
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }))
  app.use(cookieParser())

  // user router
  app.use('/api/auth', authRoutes)
  app.use('/api/customer', customerRoutes)
  app.use('/api/appointments', appointmentRoutes)
  app.use('/api/admin', adminRoutes )
  app.use('/api/admin', serviceAdminRoutes)
  app.use('/api/admin', productAdminRoutes)
  app.use('/api/customer', serviceCustomerRoutes)
  app.use('/api/customer', petRoutes)
  app.use('/api/customer', appointmentRoutes)

  // Routes
  app.use('/api/products', productRoutes)
  app.use('/api/cart', cartRoutes)
  app.use('/api/payment', paymentRoutes)
  app.use('/api/orders', orderRoutes)
  app.use(errorHandlingMiddleware)

  // Tạo HTTP server và tích hợp socket.io
  const server = http.createServer(app)
  const io = new SocketIOServer(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('sendMessage', (msg) => {
      // Broadcast lại cho tất cả client (bao gồm cả admin)
      io.emit('receiveMessage', msg)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  server.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })
}

(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas')
    await connectDB()
    console.log('2. Connected to MongoDB Cloud Atlas')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()
