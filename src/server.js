import express from 'express'
import { env } from '~/config/environment'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { connectDB } from '~/config/database'
import authRoutes from '~/routes/authRoutes'
import customerRoutes from '~/routes/customerRoutes'

const START_SERVER = () => {
  const app = express()
  // Enable req.body json data

  app.use(express.json())
  app.use('/api/auth', authRoutes)
  app.use('/api/customer', customerRoutes)
  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

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
