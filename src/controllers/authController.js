import bcrypt from 'bcrypt'
import User from '~/models/User'
import { StatusCodes } from 'http-status-codes'
import { genarateAccessToken } from '~/utils/genarateTokens'

const registerByPhone = async (req, res) => {
  try {
    const { phone, password } = req.body

    const existingUser = await User.findOne({ phone })
    if (existingUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Số điện thoại đã được đăng ký' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({ phone, password: hashedPassword })
    await newUser.save()

    res.status(201).json({ message: 'Tạo tài khoản thành công' })
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message })
  }
}

const login = async (req, res) => {
  const { phone, password } = req.body

  const currentUser = await User.findOne({ phone })
  if (!currentUser) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Số điện thoại chua đăng ký' })
  }

  if (!(await bcrypt.compare(password, currentUser.password))) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Sai MK' })
  }

  const payload = {
    _id: currentUser._id,
    role: currentUser.role,
    phone: currentUser.phone
  }

  const accessToken = genarateAccessToken(payload)

  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: false, // nếu dùng HTTPS thì để true
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 ngày
  })
  res.json({ message: 'Login successful' })
}

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false // nếu dùng HTTPS thì để true
  })

  res.status(200).json({ message: 'Logged out successfully' })

}

export const authController = {
  registerByPhone,
  login,
  logout
}
