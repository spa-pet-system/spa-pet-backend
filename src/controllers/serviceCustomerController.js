import Service from '../models/Service.js'
import { StatusCodes } from 'http-status-codes'
import cloudinary from '~/config/cloudinary.js'

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
    res.status(StatusCodes.OK).json(services)
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' })
  }
}

const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const service = await Service.findOne({ slug })
    if (!service) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy dịch vụ' })
    res.status(StatusCodes.OK).json(service)
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' })
  }
}

// Upload ảnh lên Cloudinary
const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return res.status(500).json({ error })
        res.json({ url: result.secure_url })
      }
    ).end(req.file.buffer)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const serviceCustomerController = {
  getAllServices,
  getServiceBySlug,
  uploadImage
}
