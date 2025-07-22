import Appointment from '../models/Appointment.js'
import Service from '../models/Service.js'
import mongoose from 'mongoose'
import { sendAppointmentConfirmationEmail } from '../utils/mailer.js'
import User from '../models/User.js'
import Pet from '../models/Pet.js'

// Get appointment history for a specific user
export const getUserAppointmentHistory = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUser = req.user

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }

    // Check if user can access this data (own data or admin)
    if (currentUser.role !== 'admin' && currentUser.id !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own appointment history.' })
    }

    // Find all appointments for the user and populate related data
    const appointments = await Appointment.find({ user: userId })
      .populate('user', 'name email phone')
      .populate('pet', 'name breed age')
      .populate('service', 'name price description')
      .sort({ createdAt: -1 }) // Sort by newest first
      .select('-__v')

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found for this user' })
    }

    res.status(200).json({
      message: 'Appointment history retrieved successfully',
      count: appointments.length,
      appointments
    })
  } catch (error) {
    console.error('Error fetching user appointment history:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Get all appointments (for admin)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('user', 'name email phone')
      .populate('pet', 'name breed age')
      .populate('service', 'name price description')
      .sort({ createdAt: -1 })
      .select('-__v')

    res.status(200).json({
      message: 'All appointments retrieved successfully',
      count: appointments.length,
      appointments
    })
  } catch (error) {
    console.error('Error fetching all appointments:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params

    // Validate appointmentId
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID' })
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate('user', 'name email phone')
      .populate('pet', 'name breed age')
      .populate('service', 'name price description')
      .select('-__v')

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' })
    }

    res.status(200).json({
      message: 'Appointment retrieved successfully',
      appointment
    })
  } catch (error) {
    console.error('Error fetching appointment:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Get current user's appointment history
export const getMyAppointmentHistory = async (req, res) => {
  try {
    const currentUser = req.user
    const userId = currentUser._id || currentUser.id

    // Check if userId is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' })
    }

    // Find all appointments for the current user and populate related data
    const appointments = await Appointment.find({ user: userId })
      .populate('user', 'name email phone')
      .populate('pet', 'name breed age')
      .populate('service', 'name price description')
      .sort({ createdAt: -1 }) // Sort by newest first
      .select('-__v')

    res.status(200).json({
      message: 'Your appointment history retrieved successfully',
      count: appointments.length,
      appointments
    })
  } catch (error) {
    console.error('Error fetching current user appointment history:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

const addNewAppointmentTest = async (req, res) => {
  try {
    const { user, pet, service, date, timeSlot, status, note, isPaid } = req.body

    if (!user || !pet || !service || !date || !timeSlot) {
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc!' })
    }

    const newAppointment = await Appointment.create({
      user,
      pet,
      service,
      date,
      timeSlot,
      status,
      note,
      isPaid
    })

    res.status(201).json({ message: 'Đã tạo lịch hẹn!', data: newAppointment })
  } catch (err) {
    console.error('Tạo appointment lỗi:', err)
    res.status(500).json({ message: 'Lỗi server khi tạo lịch hẹn' })
  }
}

const addNewAppointment = async (req, res) => {
  try {
    const appointment = req.body
    const {
      user,
      pet,
      service,
      date,
      timeSlot
    } = appointment

    if (!user || !pet || !service || !date || !timeSlot) {
      return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc!' })
    }

    const [userInfo, petInfo, serviceInfo] = await Promise.all([
      User.findById(user),
      Pet.findById(pet),
      Service.findById(service)
    ])

    if (!userInfo) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' })
    }
    if (!petInfo) {
      return res.status(404).json({ message: 'Thú cưng không tồn tại!' })
    }
    if (!serviceInfo) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại!' })
    }

    const existing = await Appointment.findOne({
      pet,
      date,
      timeSlot,
      status: { $ne: 'cancelled' }
    })
    if (existing) {
      return res.status(400).json({
        message: 'Thú cưng đã có lịch trong khung giờ này!'
      })
    }


    const newAppointment = await Appointment.create(appointment)

    console.log('Đã tạo lịch hẹn:', newAppointment)
    console.log('Email người nhận:', userInfo.email)

    const emailTo = userInfo.email
    if (!emailTo) {
      console.error('❌ Không có email người dùng!')
      return res.status(400).json({ message: 'Người dùng chưa có email' })
    }


    // Sau khi tạo xong -> gửi email
    await sendAppointmentConfirmationEmail(emailTo, {
      customerName: userInfo.fullName || userInfo.name || 'Khách hàng',
      service: serviceInfo.name,
      petName: petInfo.name,
      petType: petInfo.petType || 'Chưa cung cấp',
      petAge: petInfo.age || 'Chưa cung cấp',
      phone: userInfo.phone || 'Chưa cung cấp',
      date,
      time: timeSlot
    })

    res.status(201).json({ message: 'Đã tạo lịch hẹn!', data: newAppointment })
  } catch (err) {
    console.error('Tạo appointment lỗi:', err)
    res.status(500).json({ message: 'Lỗi server khi tạo lịch hẹn' })
  }
}

const countBySlot = async (req, res) => {
  try {
    const { serviceId, date } = req.query // Ex: "2025-07-19"
    const service = await Service.findById(serviceId)

    if (!serviceId || !date) {
      return res.status(400).json({ message: 'Missing serviceId or date' })
    }

    // Chuẩn hóa ngày bắt đầu/kết thúc (để tìm đúng 1 ngày)
    const dayStart = new Date(date + 'T00:00:00.000Z')
    const nextDay = new Date(dayStart)
    nextDay.setDate(nextDay.getDate() + 1)

    // Lấy danh sách Appointment đã confirmed trong ngày đó và service đó
    const appointments = await Appointment.find({
      service: serviceId,
      status: 'confirmed',
      date: { $gte: dayStart, $lt: nextDay }
    })

    // Tạo object đếm slot
    // Nếu bạn có list slot cố định, hãy liệt kê ra để đảm bảo có cả slot 0 booking
    const timeSlots = service.timeSlots // slot cố định cho service này
    const count = {}
    timeSlots.forEach(slot => count[slot] = 0) // init = 0

    // Đếm từng slot
    appointments.forEach(app => {
      if (count[app.timeSlot] !== undefined) {
        count[app.timeSlot]++
      }
    })

    res.json(count)

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const requestCancel = async (req, res) => {
  const { id } = req.params
  const { reason } = req.body
  if (!reason) return res.status(400).json({ message: 'Phải có lý do hủy.' })

  const appt = await Appointment.findById(id)
  if (!appt) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn.' })
  if (['completed', 'cancelled'].includes(appt.status))
    return res.status(400).json({ message: 'Không thể hủy lịch này.' })

  appt.status = 'request_cancel'
  appt.cancelReason = reason
  await appt.save()

  res.json({ message: 'Đã gửi yêu cầu hủy.', data: appt })
}

export const appointmentController = {
  getUserAppointmentHistory,
  getMyAppointmentHistory,
  getAllAppointments,
  getAppointmentById,
  countBySlot,
  addNewAppointment,
  requestCancel
}