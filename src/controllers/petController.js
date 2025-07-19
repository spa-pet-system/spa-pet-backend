// controllers/petController.js
import Pet from '../models/Pet.js'
import { StatusCodes } from 'http-status-codes'

// Create a new Pet
const createPet = async (req, res) => {
  try {
    const petData = req.body
    petData.owner = req.user._id // Đảm bảo user đã đăng nhập
    const pet = await Pet.create(petData)
    res.status(StatusCodes.CREATED).json(pet)
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Không thể tạo thú cưng' })
  }
}

// Get all pets of the user (with pagination)
const getPetsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query
    const query = { owner: req.user._id }
    const skip = (page - 1) * limit

    const totalItems = await Pet.countDocuments(query)
    const pets = await Pet.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })

    res.status(StatusCodes.OK).json({
      data: pets,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Number(page),
        pageSize: Number(limit)
      }
    })
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Không thể lấy danh sách thú cưng' })
  }
}

// Get all pets of the user (without pagination)
const getAllPets = async (req, res) => {
  try {
    const query = { owner: req.user._id }
    const pets = await Pet.find(query).sort({ createdAt: -1 })
    res.status(StatusCodes.OK).json(pets)
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Không thể lấy danh sách thú cưng' })
  }
}

// Get single pet by ID
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, owner: req.user._id })
    if (!pet) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy thú cưng' })
    res.status(StatusCodes.OK).json(pet)
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi khi lấy thông tin thú cưng' })
  }
}

// Update a pet
const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!pet) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy thú cưng để cập nhật' })
    res.status(StatusCodes.OK).json(pet)
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Không thể cập nhật thú cưng' })
  }
}

// Delete a pet
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!pet) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy thú cưng để xoá' })
    res.status(StatusCodes.OK).json({ message: 'Đã xoá thú cưng' })
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Không thể xoá thú cưng' })
  }
}

export const petController = {
    createPet,
    getPetsByUser,
    getAllPets,
    getPetById,
    updatePet,
    deletePet
} 