import Appointment from '../models/Appointment.js'
import Pet from '../models/Pet.js'
import Service from '../models/Service.js'
import User from '../models/User.js'
import mongoose from 'mongoose'

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

export const appointmentController = {
  getUserAppointmentHistory,
  getMyAppointmentHistory,
  getAllAppointments,
  getAppointmentById
}