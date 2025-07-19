import Service from '../models/Service.js';
import { StatusCodes } from 'http-status-codes';
import cloudinary from '../config/cloudinary.js';
import { slugify } from '../utils/formatters.js';

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(StatusCodes.OK).json(services);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' });
  }
};

const activateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!service) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Đã kích hoạt dịch vụ', service });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' });
  }
};

const deactivateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!service) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Đã ẩn dịch vụ', service });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' });
  }
};

// Upload ảnh lên Cloudinary
const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res.json({ url: result.secure_url });
      }
    ).end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createService = async (req, res) => {
  try {
    const newServiceData = {
      ...req.body,
      slug: slugify(req.body.name)
    }

    const newService = new Service(newServiceData)
    await newService.save()
    res.status(StatusCodes.CREATED).json(newService)
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message })
  }
}

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy dịch vụ' });
    res.status(StatusCodes.OK).json(service);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi server' });
  }
};

const updateService = async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedService) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy dịch vụ' });
    res.status(StatusCodes.OK).json(updatedService);
  } catch (err) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
};

export const serviceAdminController = {
  getAllServices,
  activateService,
  deactivateService,
  uploadImage,
  createService,
  getServiceById,
  updateService,
};
