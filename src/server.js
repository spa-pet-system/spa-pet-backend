import express from 'express'
import { env } from '~/config/environment'
import jwt from 'jsonwebtoken'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { StatusCodes } from 'http-status-codes'
import { connectDB } from '~/config/database'


const START_SERVER = () => {
  const app = express()
  // Enable req.body json data
  app.use(express.json())

  const books = [
    {
      id: 1,
      name: 'Chi Pheo',
      author: 'NTM'
    },
    {
      id: 2,
      name: 'jaaaashdjaskdhdh',
      author: 'NTM1'
    }
  ]

  // Use APIs V1
  app.use('/v1', (req, res) => {

  })

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)


  function authenToken(req, res, next) {
    const authorizationHeader = req.headers['authorization']
    // 'Beaer [token]'
    const token = authorizationHeader.split(' ')[1]
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'NO token' })
    }

    jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err, data) => {
      console.log(err, data)
      next()
    })
  }

  app.post('/login', (req, res) => {
    // Authentication
    // Authorization
    // { username: 'Test' }
    console.log(env.ACCESS_TOKEN_SECRET)
    const data = req.body
    console.log(req.body)

    const accessToken = jwt.sign(data, env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
    res.json({ accessToken })
  })

  app.get('/', (req, res) => {
    const user = { id: 2, name: 'Do', email: 'draculedolar0763@gmail.com' }
    res.render('home', { title: 'Trang chu', user })
  })

  app.get('/books', authenToken, (req, res) => {
    res.json({ status: 'Success', data: books })
  })

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
