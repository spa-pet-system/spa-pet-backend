import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^0[0-9]{9}$/, 'Invalid Phone Number']
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30
    },
    refreshToken: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true // tạo createdAt và updatedAt
  }
)

const User = mongoose.model('User', userSchema)
export default User
