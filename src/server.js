import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { env } from '~/config/environment'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { connectDB } from '~/config/database'
import authRoutes from '~/routes/authRoutes'
import customerRoutes from '~/routes/customerRoutes'
import cookieParser from 'cookie-parser'
import cors from 'cors'

export const userSocketMap = new Map()
let io = null

const START_SERVER = () => {
  const app = express()
  const server = http.createServer(app)

  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    }
  })

  app.use(express.json())
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
  app.use(cookieParser())
  app.use(errorHandlingMiddleware)
  app.use('/api/auth', authRoutes)
  app.use('/api/customer', customerRoutes)

  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id)

    socket.on('registerUser', (userId) => {
      userSocketMap.set(userId, socket.id)
    })

    socket.on('sendNotificationToUsers', ({ userIds, notification }) => {
      userIds.forEach(userId => {
        const socketId = userSocketMap.get(userId)
        if (socketId) {
          io.to(socketId).emit('receiveNotification', notification)
        }
      })
    })

    // Xử lý chat message và trả lời tự động
    socket.on('sendMessage', (message) => {
      console.log('Received chat message:', message)

      // Tạo tin nhắn trả lời tự động
      const autoReply = {
        from: 'admin',
        content: 'Cảm ơn bạn đã gửi tin nhắn! Admin sẽ phản hồi sớm.',
        timestamp: new Date(),
      }

      // Gửi lại cho chính client vừa gửi tin nhắn
      socket.emit('receiveMessage', autoReply)
    })

    socket.on('disconnect', () => {
      for (let [uid, sid] of userSocketMap.entries()) {
        if (sid === socket.id) {
          userSocketMap.delete(uid)
          break
        }
      }
      console.log('❌ Socket disconnected:', socket.id)
    })
  })

  server.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`🚀 Server running at http://${env.APP_HOST}:${env.APP_PORT}/`)
  })
}

;(async () => {
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

export { io }
