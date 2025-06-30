import mongoose from 'mongoose'

const petSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  type: String, // "dog", "cat"
  breed: String, //"Cỏgi"
  age: Number,
  weight: Number,
  image: String
}, { timestamps: true })

const Pet = mongoose.model('Pet', petSchema)
export default Pet
