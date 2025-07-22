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
import adminNotifications from './routes/adminNotifications.js';

// product
import productRoutes from '~/routes/productRoutes'
import cartRoutes from './routes/cartRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import Message from './models/Message.js';
import User from './models/User.js';
import chatRoutes from './routes/chatRoutes.js';

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
  app.use('/api/admin', adminNotifications);
  app.use('/api/customer', serviceCustomerRoutes)
  app.use('/api/customer', petRoutes)
  app.use('/api/customer', appointmentRoutes)
  app.use('/api/chat', chatRoutes);

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

  // Map userId <-> socketId
  const userSocketMap = new Map(); // userId -> socketId
  const socketUserMap = new Map(); // socketId -> userId
  const adminSocketIds = new Set(); // Lưu socketId của các admin đang online

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Khi client join, truyền userId lên
    socket.on('join', async ({ userId }) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
        socketUserMap.set(socket.id, userId);
        // Kiểm tra nếu là admin thì thêm vào danh sách admin online
        try {
          const user = await User.findById(userId);
          if (user && user.role === 'admin') {
            adminSocketIds.add(socket.id);
            console.log(`Admin online: ${userId} (socket ${socket.id})`);
          } else {
            console.log(`User online: ${userId} (socket ${socket.id})`);
          }
        } catch (err) {
          console.log('Lỗi khi kiểm tra role user:', err);
        }
        console.log(`User ${userId} joined with socket ${socket.id}`);
      }
    });

    // Gửi tin nhắn: { from, to, content }
    socket.on('sendMessage', async (msg) => {
      const { from, to, content } = msg;
      if (!from || !content) return;
      try {
        let message;
        if (to === 'admin') {
          // Không lưu trường to, chỉ lưu from và content
          message = await Message.create({ from, content });
          console.log('Gửi tin nhắn đến tất cả admin online:', Array.from(adminSocketIds));
          adminSocketIds.forEach(adminSocketId => {
            io.to(adminSocketId).emit('receiveMessage', message);
            console.log('Đã emit receiveMessage đến admin socket:', adminSocketId);
          });
        } else {
          // Lưu bình thường nếu to là ObjectId
          message = await Message.create({ from, to, content });
          const toSocketId = userSocketMap.get(to);
          if (toSocketId) {
            io.to(toSocketId).emit('receiveMessage', message);
            console.log('Đã emit receiveMessage đến user socket:', toSocketId);
          }
        }
        socket.emit('receiveMessage', message);
        console.log('Đã emit receiveMessage về cho người gửi:', socket.id);
      } catch (err) {
        console.error('Lỗi gửi/lưu tin nhắn:', err);
      }
    });

    socket.on('disconnect', async () => {
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        userSocketMap.delete(userId);
        socketUserMap.delete(socket.id);
        try {
          const user = await User.findById(userId);
          if (user && user.role === 'admin') {
            adminSocketIds.delete(socket.id);
            console.log(`Admin offline: ${userId} (socket ${socket.id})`);
          }
        } catch {}
        console.log(`User ${userId} disconnected (socket ${socket.id})`);
      } else {
        console.log('User disconnected:', socket.id);
      }
    });
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
