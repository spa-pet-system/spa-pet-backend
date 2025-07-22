import mongoose from 'mongoose'

const petSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  petType:{
    type: String,
    enum: ['dog', 'cat'],
    required: true },
  breed: String, //"Cỏgi"
  age: Number,
  weight: Number,
  image: String
}, { timestamps: true })

const Pet = mongoose.model('Pet', petSchema)
export default Pet
